// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Tentukan di mana kita akan menampilkan berita
    const container = document.getElementById('berita-container');

    // 2. Fungsi untuk mengambil data dari berita.json
    async function ambilBerita() {
        try {
            // Kita tambahkan 'cache-buster' agar browser selalu ambil versi terbaru
            const response = await fetch(`berita.json?v=${new Date().getTime()}`);
            
            if (!response.ok) {
                throw new Error(`Gagal memuat berita: ${response.statusText}`);
            }
            
            const berita = await response.json();
            
            // 3. Panggil fungsi untuk menampilkan berita
            tampilkanBerita(berita);

        } catch (error) {
            console.error('Error mengambil berita:', error);
            container.innerHTML = '<p style="text-align: center; color: red;">Maaf, gagal memuat berita terbaru.</p>';
        }
    }

    // 4. Fungsi untuk mengubah data JSON menjadi kartu HTML
    function tampilkanBerita(berita) {
        // Kosongkan dulu pesan "Memuat berita..."
        container.innerHTML = '';

        // Jika tidak ada berita (file JSON kosong)
        if (berita.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Tidak ada berita terbaru saat ini.</p>';
            return;
        }

        // Loop setiap artikel di dalam data JSON
        berita.forEach(artikel => {
            // Buat elemen 'article' baru dengan class 'card'
            const kartu = document.createElement('article');
            kartu.className = 'card';

            // Mengubah format waktu (dari UTC ke lokal)
            const waktuPublikasi = new Date(artikel.published_utc);
            const waktuLokal = waktuPublikasi.toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Isi HTML untuk kartu tersebut
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

            // Tambahkan kartu baru ini ke dalam wadah
            container.appendChild(kartu);
        });
    }

    // 5. Jalankan fungsi utamanya!
    ambilBerita();
});
