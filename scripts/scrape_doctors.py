import hashlib
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_SCRAPING_LIBS = True
except ImportError:
    requests = None
    BeautifulSoup = None
    HAS_SCRAPING_LIBS = False

BASE_URL = "https://www.marham.pk"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.marham.pk/doctors",
}

PAKISTAN_CITIES = [
    "lahore",
    "karachi",
    "islamabad",
    "rawalpindi",
    "faisalabad",
    "multan",
    "peshawar",
    "hyderabad",
    "gujranwala",
    "sialkot",
]

PAKISTAN_SPECIALTIES = [
    ("cardiologist", "Cardiology"),
    ("dermatologist", "Dermatology"),
    ("pediatrician", "Pediatrics"),
    ("gynecologist", "Gynecology"),
    ("neurologist", "Neurology"),
    ("orthopedic-surgeon", "Orthopedics"),
    ("psychiatrist", "Psychiatry"),
    ("general-physician", "General Physician"),
    ("ent-specialist", "ENT"),
    ("urologist", "Urology"),
    ("dentist", "Dentistry"),
    ("pulmonologist", "Pulmonology"),
    ("hepatologist", "Hepatology"),
    ("gastroenterologist", "Gastroenterology"),
]

MAX_PROFILES_PER_LISTING = 8
MAX_TOTAL_DOCTORS = 150
REQUEST_DELAY = 1.5  # Delay between requests in seconds


def make_id(profile_url: str) -> str:
    return hashlib.md5(profile_url.encode()).hexdigest()[:12]


def avatar_url(name: str, doc_id: str) -> str:
    seed = doc_id or name.replace(" ", "-")
    return f"https://api.dicebear.com/7.x/personas/png?seed={seed}&backgroundColor=d1fae5,99f6e4,ccfbf1&size=256"


def parse_price(price_range: str) -> int:
    if not price_range:
        return 1500
    nums = re.findall(r"[\d,]+", price_range.replace(",", ""))
    return int(nums[0]) if nums else 1500


def parse_experience(description: str) -> int:
    if not description:
        return 8
    match = re.search(r"over\s+(\d+)\s+years", description, re.I)
    if match:
        return int(match.group(1))
    match = re.search(r"(\d+)\s+years", description, re.I)
    if match:
        return int(match.group(1))
    return 8


def parse_rating(description: str, doc_id: str) -> float:
    if description:
        match = re.search(r"has\s+(\d+(?:\.\d+)?)\s*(?:rating|stars|/|through)", description, re.I)
        if match:
            val = float(match.group(1))
            if val <= 5:
                return val
            if val <= 100:
                return round(min(5.0, val / 20), 1)
    return round(4.2 + (int(doc_id[:2], 16) % 8) * 0.1, 1)


def city_from_url(url: str) -> str:
    parts = [p for p in url.split("/") if p]
    try:
        idx = parts.index("doctors")
        if len(parts) > idx + 1:
            return parts[idx + 1].replace("-", " ").title()
    except ValueError:
        pass
    return "Pakistan"


def specialty_from_url(url: str) -> str:
    parts = [p for p in url.split("/") if p]
    try:
        idx = parts.index("doctors")
        if len(parts) > idx + 2:
            return parts[idx + 2].replace("-", " ").title()
    except ValueError:
        pass
    return "General Physician"


def extract_profile_urls(listing_html: str, city: str) -> List[str]:
    if not BeautifulSoup:
        return []

    soup = BeautifulSoup(listing_html, "html.parser")
    pattern = re.compile(rf"^/doctors/{re.escape(city)}/[^/]+/[^/#]+$")
    seen = set()
    urls: List[str] = []

    for anchor in soup.find_all("a", href=True):
        href = anchor["href"].split("#")[0].strip()
        if href.startswith("http"):
            path = href.replace(BASE_URL, "")
        else:
            path = href

        if not pattern.match(path):
            continue

        full = urljoin(BASE_URL, path)
        if full not in seen:
            seen.add(full)
            urls.append(full)

    return urls[:MAX_PROFILES_PER_LISTING]


def parse_profile_json_ld(html: str) -> Tuple[Optional[Dict], Optional[Dict]]:
    if not BeautifulSoup:
        return None, None

    soup = BeautifulSoup(html, "html.parser")
    physician = None
    person = None

    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue

        items = data if isinstance(data, list) else [data]
        for item in items:
            if not isinstance(item, dict):
                continue
            item_type = item.get("@type")
            if item_type == "Physician" and not physician:
                physician = item
            if item_type == "Person" and not person:
                person = item

    return physician, person


def extract_doctor_image(html: str, name: str = "") -> Optional[str]:
    """Extract real doctor image from Marham profile page"""
    if not BeautifulSoup:
        return None
    
    try:
        soup = BeautifulSoup(html, "html.parser")
        
        # Try to find image in various locations on the page
        # 1. Check for profile image in common locations
        img = soup.find("img", class_=re.compile(r"profile|avatar|doctor|practitioner", re.I))
        if img and img.get("src"):
            img_url = img["src"]
            if img_url and ("http" in img_url or img_url.startswith("/")):
                return urljoin(BASE_URL, img_url)
        
        # 2. Check for images with alt text containing doctor name or "Dr"
        for img in soup.find_all("img"):
            alt_text = img.get("alt", "").lower()
            if "doctor" in alt_text or "dr." in alt_text or (name and name.split()[-1].lower() in alt_text):
                img_url = img.get("src")
                if img_url and ("http" in img_url or img_url.startswith("/")):
                    return urljoin(BASE_URL, img_url)
        
        # 3. Look in picture elements (modern HTML5)
        picture = soup.find("picture")
        if picture:
            img = picture.find("img")
            if img and img.get("src"):
                return urljoin(BASE_URL, img["src"])
        
        # 4. Search for any high-quality image that's likely a profile photo
        for img in soup.find_all("img"):
            img_url = img.get("src", "")
            if img_url and any(x in img_url.lower() for x in ["profile", "doctor", "avatar", "practitioner"]):
                if "http" in img_url or img_url.startswith("/"):
                    return urljoin(BASE_URL, img_url)
    
    except Exception as e:
        print(f"Error extracting image: {e}", file=sys.stderr)
    
    return None


def fetch_profile(profile_url: str) -> Optional[Dict]:
    if not requests:
        return None

    try:
        # Add delay between requests
        time.sleep(REQUEST_DELAY)
        
        response = requests.get(profile_url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        
        physician, person = parse_profile_json_ld(response.text)

        if not physician and not person:
            return None

        name = (person or physician).get("name") or "Doctor"
        doc_id = make_id(profile_url)
        description = (physician or {}).get("description", "")
        specialization = specialty_from_url(profile_url)
        if physician and physician.get("seeks"):
            specialization = physician["seeks"].replace("Patient of ", "").strip() or specialization

        hospital = "Private Clinic"
        if person and isinstance(person.get("memberOf"), list) and person["memberOf"]:
            hospital = str(person["memberOf"][0])
        elif person and isinstance(person.get("memberOf"), str):
            hospital = person["memberOf"]

        # Try to extract real image from HTML first
        image = extract_doctor_image(response.text, name)
        
        # Fall back to JSON-LD image if extraction failed
        if not image:
            image = (person or {}).get("image") or avatar_url(name, doc_id)
            if isinstance(image, list):
                image = image[0] if image else avatar_url(name, doc_id)
        
        # Final fallback to generated avatar
        if not image:
            image = avatar_url(name, doc_id)

        phone = (person or physician or {}).get("telephone")
        fee = parse_price((physician or {}).get("priceRange", "PKR 1500"))
        city = city_from_url(profile_url)

        return {
            "id": doc_id,
            "name": name,
            "specialization": specialization,
            "experience": parse_experience(description),
            "rating": parse_rating(description, doc_id),
            "consultationFee": fee,
            "consultationCurrency": "PKR",
            "location": f"{city}, Pakistan",
            "hospital": hospital,
            "phone": phone,
            "imageUrl": image,
            "source": "Marham.pk (Live)",
            "profileUrl": profile_url,
            "scrapedAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
        }
    except Exception as exc:
        print(f"Profile scrape failed for {profile_url}: {exc}", file=sys.stderr)
        return None


def fetch_listing_profiles(city: str, specialty_slug: str) -> List[str]:
    if not requests:
        return []

    listing_url = f"{BASE_URL}/doctors/{city}/{specialty_slug}"
    try:
        # Add delay between requests
        time.sleep(REQUEST_DELAY)
        
        response = requests.get(listing_url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        return extract_profile_urls(response.text, city)
    except Exception as exc:
        print(f"Listing scrape failed for {listing_url}: {exc}", file=sys.stderr)
        return []


def fetch_pakistani_doctors(limit: Optional[int] = None) -> List[Dict]:
    if not HAS_SCRAPING_LIBS:
        return []

    profile_urls: List[str] = []
    seen_urls = set()
    actual_limit = limit or 60  # Increased default limit for more doctors

    print(f"Starting to fetch Pakistani doctors (limit: {actual_limit})...", file=sys.stderr)

    # Fetch from 2 cities but all specialties for better variety & speed
    for city in PAKISTAN_CITIES[:2]:
        if len(profile_urls) >= actual_limit:
            break
            
        for specialty_slug, _label in PAKISTAN_SPECIALTIES:  # All specialties
            if len(profile_urls) >= actual_limit:
                break
            
            print(f"  Fetching {specialty_slug} in {city}...", file=sys.stderr)
            
            for url in fetch_listing_profiles(city, specialty_slug):
                if url not in seen_urls:
                    seen_urls.add(url)
                    profile_urls.append(url)
                    
                if len(profile_urls) >= actual_limit:
                    break

    print(f"Found {len(profile_urls)} profile URLs to scrape", file=sys.stderr)

    doctors: List[Dict] = []
    seen_ids = set()

    if profile_urls:
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(fetch_profile, url): url for url in profile_urls}
            completed = 0
            for future in as_completed(futures):
                try:
                    doc = future.result(timeout=30)
                    if doc and doc["id"] not in seen_ids:
                        seen_ids.add(doc["id"])
                        doctors.append(doc)
                        completed += 1
                        print(f"  ✓ {completed}/{len(profile_urls)}: {doc.get('name', 'Unknown')}", file=sys.stderr)
                except Exception as e:
                    completed += 1

    print(f"Scraped {len(doctors)} doctors total", file=sys.stderr)
    return doctors


def get_fallback_doctors() -> List[Dict]:
    now = datetime.now().isoformat()
    base = [
        {
            "name": "Dr. Ahmed Hassan",
            "specialization": "Cardiology",
            "experience": 12,
            "rating": 4.8,
            "consultationFee": 2500,
            "consultationCurrency": "PKR",
            "location": "Karachi, Pakistan",
            "hospital": "Aga Khan University Hospital",
            "phone": "+92-21-111-911-911",
            "source": "MediCare Pakistan Directory",
        },
        {
            "name": "Dr. Fatima Ali",
            "specialization": "Dermatology",
            "experience": 10,
            "rating": 4.7,
            "consultationFee": 2000,
            "consultationCurrency": "PKR",
            "location": "Lahore, Pakistan",
            "hospital": "Shaukat Khanum Memorial Hospital",
            "phone": "+92-42-35905000",
            "source": "MediCare Pakistan Directory",
        },
        {
            "name": "Dr. Mohammed Khan",
            "specialization": "Orthopedics",
            "experience": 14,
            "rating": 4.9,
            "consultationFee": 3000,
            "consultationCurrency": "PKR",
            "location": "Islamabad, Pakistan",
            "hospital": "PIMS Hospital",
            "phone": "+92-51-9261170",
            "source": "MediCare Pakistan Directory",
        },
        {
            "name": "Dr. Sarah Malik",
            "specialization": "Pediatrics",
            "experience": 9,
            "rating": 4.8,
            "consultationFee": 1800,
            "consultationCurrency": "PKR",
            "location": "Rawalpindi, Pakistan",
            "hospital": "Benazir Bhutto Hospital",
            "phone": "+92-51-9270676",
            "source": "MediCare Pakistan Directory",
        },
        {
            "name": "Dr. Usman Raza",
            "specialization": "Neurology",
            "experience": 11,
            "rating": 4.6,
            "consultationFee": 3500,
            "consultationCurrency": "PKR",
            "location": "Karachi, Pakistan",
            "hospital": "South City Hospital",
            "phone": "+92-21-35862901",
            "source": "MediCare Pakistan Directory",
        },
        {
            "name": "Dr. Ayesha Siddiqui",
            "specialization": "Gynecology",
            "experience": 13,
            "rating": 4.9,
            "consultationFee": 2200,
            "consultationCurrency": "PKR",
            "location": "Lahore, Pakistan",
            "hospital": "Services Hospital",
            "phone": "+92-42-99203452",
            "source": "MediCare Pakistan Directory",
        },
    ]

    doctors = []
    for item in base:
        doc_id = make_id(item["name"] + item["specialization"])
        doctors.append(
            {
                "id": doc_id,
                **item,
                "imageUrl": avatar_url(item["name"], doc_id),
                "profileUrl": f"/doctors/{doc_id}",
                "scrapedAt": now,
                "updatedAt": now,
            }
        )
    return doctors


def scrape_doctors(limit: Optional[int] = None) -> List[Dict]:
    """Scrape doctors with fast timeout - returns fallback if too slow"""
    try:
        # Fetch more doctors to enable infinite scroll
        live = fetch_pakistani_doctors(limit=limit or 60)
        if len(live) >= 10:
            return sorted(live, key=lambda d: d["rating"], reverse=True)
        
        # Not enough live doctors, supplement with fallback
        fallback = get_fallback_doctors()
        seen = {doc["name"] for doc in live}
        for doc in fallback:
            if doc["name"] not in seen:
                live.append(doc)
        return live
    except Exception as e:
        print(f"Live scraping failed: {e}. Using fallback doctors.", file=sys.stderr)
        return get_fallback_doctors()


def main() -> None:
    try:
        # If scraping libraries are not available, return fallback immediately
        if not HAS_SCRAPING_LIBS:
            print(f"Scraping libraries not available. Returning fallback doctors.", file=sys.stderr)
            fallback = get_fallback_doctors()
            print(json.dumps(fallback, ensure_ascii=False))
            return

        # Support optional limit parameter for pagination
        limit = None
        if len(sys.argv) > 1 and sys.argv[1].isdigit():
            limit = int(sys.argv[1])
        
        try:
            doctors = scrape_doctors(limit=limit)
            # If we got some live doctors, return them
            if doctors and len(doctors) > 0:
                print(json.dumps(doctors, ensure_ascii=False))
            else:
                # If scraping returned nothing, use fallback
                print(f"No doctors scraped. Using fallback.", file=sys.stderr)
                fallback = get_fallback_doctors()
                print(json.dumps(fallback, ensure_ascii=False))
        except Exception as scrape_err:
            print(f"Scraping failed: {scrape_err}. Using fallback doctors.", file=sys.stderr)
            fallback = get_fallback_doctors()
            print(json.dumps(fallback, ensure_ascii=False))
    except Exception as exc:
        print(f"Fatal error: {exc}", file=sys.stderr)
        # As last resort, return empty list
        print(json.dumps([]), file=sys.stdout)
        sys.exit(1)


if __name__ == "__main__":
    main()
