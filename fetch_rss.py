import feedparser
import json
import time
from datetime import datetime, timezone
from difflib import SequenceMatcher # <-- IMPORT BARU KITA

# DAFTAR RSS FEED KITA (15 sumber)
RSS_FEEDS = {
    "CISA": "https://www.cisa.gov/feeds/all.xml",
    "The Hacker News": "https://feeds.feedburner.com/TheHackerNews",
    "BleepingComputer": "https://www.bleepingcomputer.com/feed/",
    "Dark Reading": "https://www.darkreading.com/rss_simple.asp",
    "SecurityWeek": "https://www.securityweek.com/feed/",
    "KrebsOnSecurity": "https://krebsonsecurity.com/feed/",
    "InfosecurityMag": "https://www.infosecurity-magazine.com/rss/news/",
    "CSO Online": "https://www.csoonline.com/feed/",
    "Threatpost": "https://threatpost.com/feed/",
    "WIRED Security": "https://www.wired.com/feed/category/security/rss",
    "NVD (NIST)": "https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml",
    "WeLiveSecurity": "https://www.welivesecurity.com/feed/",
    "Schneier": "https://www.schneier.com/feed/",
    "PortSwigger": "https://portswigger.net/daily-swig/rss",
    "ZDNet Security": "https://www.zdnet.com/topic/security/rss.xml"
}

def parse_date(entry):
    """Mencoba mem-parsing tanggal dari berbagai format"""
    if 'published_parsed' in entry and entry.published_parsed:
        return datetime.fromtimestamp(time.mktime(entry.published_parsed)).astimezone(timezone.utc)
    elif 'updated_parsed' in entry and entry.updated_parsed:
        return datetime.fromtimestamp(time.mktime(entry.updated_parsed)).astimezone(timezone.utc)
    else:
        return datetime.now(timezone.utc)

def fetch_all_feeds():
    """Mengambil semua berita, men-de-duplikasi, dan menggabungkannya"""
    all_entries = []
    seen_titles = [] # <-- INI PENTING: Penyimpan judul unik
    
    # Ambang batas kemiripan (0.8 = 80% mirip). Bisa diubah jika perlu.
    SIMILARITY_THRESHOLD = 0.8 

    print(f"Memulai proses fetch untuk {len(RSS_FEEDS)} feeds...")

    for source_name, feed_url in RSS_FEEDS.items():
        try:
            print(f"Mengambil dari: {source_name}...")
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries:
                new_title = entry.title
                is_duplicate = False

                # ---- LOGIKA DE-DUPLIKASI DIMULAI ----
                for seen_title in seen_titles:
                    # Bandingkan judul baru vs judul yang sudah disimpan (case-insensitive)
                    s = SequenceMatcher(None, new_title.lower(), seen_title.lower())
                    
                    if s.ratio() > SIMILARITY_THRESHOLD:
                        is_duplicate = True
                        print(f"  -> DUPLIKAT terdeteksi. MELEWATI: '{new_title}' (Mirip dengan: '{seen_title}')")
                        break # Hentikan pencarian, sudah pasti duplikat
                # ---- LOGIKA DE-DUPLIKASI SELESAI ----

                # Jika BUKAN duplikat, baru kita proses
                if not is_duplicate:
                    summary = entry.get('summary', entry.get('description', ''))
                    if '<' in summary:
                        summary = summary.split('<')[0].strip() 
                    summary = (summary[:150] + '...') if len(summary) > 153 else summary

                    parsed_entry = {
                        "source": source_name,
                        "title": entry.title,
                        "link": entry.link,
                        "summary": summary,
                        "published_utc": parse_date(entry).isoformat()
                    }
                    
                    all_entries.append(parsed_entry)
                    seen_titles.append(new_title) # Daftarkan judul ini sebagai unik

        except Exception as e:
            print(f"Gagal mengambil dari {source_name}: {e}")

    # Log kita ubah jadi menghitung judul unik
    print(f"Total {len(seen_titles)} berita UNIK berhasil diambil.")

    # Urutkan semua berita dari yang paling baru
    all_entries.sort(key=lambda x: x['published_utc'], reverse=True)

    # Ambil 500 berita terbaru saja (dari yang sudah unik)
    top_entries = all_entries[:500]

    # Dapatkan waktu "sekarang" dalam format UTC
    now_utc = datetime.now(timezone.utc).isoformat()

    # Buat format output BARU (Objek, bukan List)
    final_output = {
        "lastUpdatedUTC": now_utc,
        "articles": top_entries
    }

    # Simpan ke file JSON
    try:
        with open('berita.json', 'w', encoding='utf-8') as f:
            json.dump(final_output, f, ensure_ascii=False, indent=4)
        print(f"File berita.json berhasil dibuat/diperbarui pada {now_utc}")
    except Exception as e:
        print(f"Gagal menulis ke berita.json: {e}")

if __name__ == "__main__":
    fetch_all_feeds()
