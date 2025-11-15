import feedparser # Library untuk membaca RSS
import json
import time
from datetime import datetime, timezone

# DAFTAR RSS FEED KITA (Bahan Baku)
# Kita bisa tambah atau kurangi daftar ini kapan saja
RSS_FEEDS = {
    "The Hacker News": "https://feeds.feedburner.com/TheHackersNews", 
    "BleepingComputer": "https://www.bleepingcomputer.com/feed/",
    "Dark Reading": "https://www.darkreading.com/rss.xml",
    "SecurityWeek": "https://feeds.feedburner.com/securityweek",
    "CISA": "https://www.cisa.gov/news.xml",
    "KrebsOnSecurity": "https://krebsonsecurity.com/feed/",
    "InfosecurityMag": "https://www.infosecurity-magazine.com/rss/news/",
    "CSO Online": "https://www.csoonline.com/feed/",
    "Threatpost": "https://threatpost.com/feed/",
    "WIRED Security": "https://www.wired.com/feed/category/security/latest/rss",
    "NVD (NIST)": "https://www.nist.gov/news-events/cybersecurity/rss.xml",
    "WeLiveSecurity": "https://www.welivesecurity.com/en/rss/feed/",
    "Schneier": "https://www.schneier.com/feed/",
    "PortSwigger": "https://portswigger.net/research/rss",
    "ZDNet Security": "https://www.zdnet.com/topic/security/rss.xml"
}

def parse_date(entry):
    """Mencoba mem-parsing tanggal dari berbagai format"""
    if 'published_parsed' in entry and entry.published_parsed:
        return datetime.fromtimestamp(time.mktime(entry.published_parsed)).astimezone(timezone.utc)
    elif 'updated_parsed' in entry and entry.updated_parsed:
        return datetime.fromtimestamp(time.mktime(entry.updated_parsed)).astimezone(timezone.utc)
    else:
        # Jika tidak ada tanggal, gunakan waktu sekarang sebagai fallback
        return datetime.now(timezone.utc)

def fetch_all_feeds():
    """Mengambil semua berita dari semua feed dan menggabungkannya"""
    all_entries = []
    
    print(f"Memulai proses fetch untuk {len(RSS_FEEDS)} feeds...")

    for source_name, feed_url in RSS_FEEDS.items():
        try:
            print(f"Mengambil dari: {source_name}...")
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries:
                # Kadang 'summary' ada di 'description'
                summary = entry.get('summary', entry.get('description', ''))
                
                # Membersihkan HTML sederhana dari summary (jika ada)
                if '<' in summary:
                    # Ini cara simpel, bukan parser HTML lengkap
                    summary = summary.split('<')[0].strip() 
                
                # Batasi panjang summary
                summary = (summary[:150] + '...') if len(summary) > 153 else summary

                parsed_entry = {
                    "source": source_name,
                    "title": entry.title,
                    "link": entry.link,
                    "summary": summary,
                    "published_utc": parse_date(entry).isoformat() # Format standar ISO 8601
                }
                all_entries.append(parsed_entry)
        except Exception as e:
            print(f"Gagal mengambil dari {source_name}: {e}")

    print(f"Total {len(all_entries)} berita berhasil diambil.")

    # Urutkan semua berita dari yang paling baru
    all_entries.sort(key=lambda x: x['published_utc'], reverse=True)

    # Ambil 50 berita terbaru saja
    top_entries = all_entries[:75]

    # Simpan ke file JSON
    try:
        with open('berita.json', 'w', encoding='utf-8') as f:
            json.dump(top_entries, f, ensure_ascii=False, indent=4)
        print("File berita.json berhasil dibuat/diperbarui.")
    except Exception as e:
        print(f"Gagal menulis ke berita.json: {e}")

if __name__ == "__main__":
    fetch_all_feeds()
