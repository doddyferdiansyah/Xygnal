// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DEKLARASI VARIABEL ---
    const container = document.getElementById('berita-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchBar = document.getElementById('search-bar'); // Variabel baru
    
    let allNews = []; // Akan menyimpan SEMUA berita
    
    // Variabel untuk menyimpan filter aktif
    let currentFilter = 'all'; 
    let currentSearchTerm = '';

    // --- 2. FUNGSI UTAMA PENGAMBIL DATA ---
    async function ambilBerita() {
        try {
            const response = await fetch(`berita.json?v=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error(`Gagal memuat berita: ${response.statusText}`);
            }
            
            const berita = await response.json();
            allNews = berita; 
            
            // Tampilkan SEMUA berita saat pertama kali dimuat
            tampilkanBerita(); 

        } catch (error) {
            console.error('Error mengambil berita:', error);
            container.innerHTML = '<p style="text-align: center; color: red;">Maaf, gagal memuat berita terbaru.</p>';
        }
    }

    // --- 3. FUNGSI UNTUK MENAMPILKAN BERITA (SUDAH DIPERBARUI) ---
    // Fungsi ini sekarang akan memeriksa filter DAN search bar
    function tampilkanBerita() {
        // Kosongkan dulu wadah berita
        container.innerHTML = '';

        // --- Logika Filter ---
        let beritaYangDisaring = [];
        if (currentFilter === 'all') {
            beritaYangDisaring = allNews;
        } else {
            beritaYangDisaring = allNews.filter(artikel => artikel.source === currentFilter);
        }

        // --- Logika Pencarian ---
        // 'finalNews' adalah hasil setelah difilter DAN dicari
        let finalNews = [];
        if (currentSearchTerm === '') {
            finalNews = beritaYangDisaring;
        } else {
            // Ubah kata kunci pencarian ke huruf kecil
            const searchTermLower = currentSearchTerm.toLowerCase();
            
            finalNews = beritaYangDisaring.filter(artikel => {
                // Cek apakah kata kunci ada di 'title' ATAU 'summary'
                const titleMatch = artikel.title.toLowerCase().includes(searchTermLower);
                const summaryMatch = artikel.summary.toLowerCase().includes(searchTermLower);
                return titleMatch || summaryMatch;
            });
        }
        
        // --- Menampilkan hasil akhir ---
        if (finalNews.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Tidak ada berita yang cocok dengan pencarian Anda.</p>';
            return;
        }

        // Loop setiap artikel di dalam data JSON yang sudah difilter & dicari
        finalNews.forEach(artikel => {
            const kartu = document.createElement('article');
            kartu.className = 'card';

            const waktuPublikasi = new Date(artikel.published_utc);
            const waktuLokal = waktuPublikasi.toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            kartu.innerHTML = `
                <h3>
                    <a href="${artikel.link}" target="_blank" rel="noopener noreferrer">
                        ${artikel.title}
                    </a>
                </h3>
                <p class="summary">${artikel.summary}</p>
                <div class="meta">
                    <span class="source">${artikel.source}</span>
                    <span class="time">${waktuLokal}</span>
                </div>
            `;
            container.appendChild(kartu);
        });
    }

    // --- 4. LISTENER UNTUK TOMBOL FILTER ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.getAttribute('data-source'); // Update filter aktif
            
            // Atur tampilan tombol "active"
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Panggil ulang fungsi tampilkanBerita
            tampilkanBerita();
        });
    });

    // --- 5. LISTENER BARU UNTUK SEARCH BAR ---
    // 'input' berarti event ini jalan SETIAP KALI pengguna mengetik
    searchBar.addEventListener('input', (e) => {
        // Update kata kunci pencarian
        currentSearchTerm = e.target.value;
        
        // Panggil ulang fungsi tampilkanBerita
        tampilkanBerita();
    });

    // --- 6. JALANKAN FUNGSI UTAMA ---
    ambilBerita();
});
