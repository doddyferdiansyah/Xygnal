// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DEKLARASI VARIABEL ---
    const container = document.getElementById('berita-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Variabel ini akan menyimpan SEMUA berita dari JSON
    let allNews = [];

    // --- 2. FUNGSI UTAMA PENGAMBIL DATA ---
    async function ambilBerita() {
        try {
            const response = await fetch(`berita.json?v=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error(`Gagal memuat berita: ${response.statusText}`);
            }
            
            const berita = await response.json();
            
            // Simpan berita ke variabel global kita
            allNews = berita; 
            
            // Tampilkan SEMUA berita saat pertama kali dimuat
            tampilkanBerita('all'); 

        } catch (error) {
            console.error('Error mengambil berita:', error);
            container.innerHTML = '<p style="text-align: center; color: red;">Maaf, gagal memuat berita terbaru.</p>';
        }
    }

    // --- 3. FUNGSI UNTUK MENAMPILKAN BERITA (DENGAN FILTER) ---
    function tampilkanBerita(sumberFilter) {
        // Kosongkan dulu wadah berita
        container.innerHTML = '';

        // Tentukan berita mana yang mau ditampilkan
        let beritaYangDitampilkan = [];
        if (sumberFilter === 'all') {
            beritaYangDitampilkan = allNews;
        } else {
            // Filter array 'allNews' berdasarkan sumber yang dipilih
            beritaYangDitampilkan = allNews.filter(artikel => artikel.source === sumberFilter);
        }

        // Jika hasil filter kosong
        if (beritaYangDitampilkan.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Tidak ada berita untuk sumber ini.</p>';
            return;
        }

        // Loop setiap artikel di dalam data JSON yang sudah difilter
        beritaYangDitampilkan.forEach(artikel => {
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

    // --- 4. TAMBAHKAN LISTENER UNTUK TOMBOL FILTER ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            
            // 1. Dapatkan nama sumber dari tombol yang diklik
            const sumber = button.getAttribute('data-source');

            // 2. Atur tampilan tombol "active"
            // Hapus 'active' dari SEMUA tombol
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Tambahkan 'active' HANYA ke tombol yang diklik
            button.classList.add('active');

            // 3. Panggil ulang fungsi tampilkanBerita dengan filter baru
            tampilkanBerita(sumber);
        });
    });

    // --- 5. JALANKAN FUNGSI UTAMA ---
    ambilBerita();
});
