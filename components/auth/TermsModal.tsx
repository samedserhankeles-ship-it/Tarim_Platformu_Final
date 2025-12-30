"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function TermsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="font-semibold text-primary hover:underline cursor-pointer">
          Kullanıcı Sözleşmesi, KVKK Metni ve Çerez Politikasını
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kullanıcı Sözleşmesi ve Politikalar</DialogTitle>
          <DialogDescription>
            Lütfen aşağıdaki metinleri dikkatlice okuyunuz. Kayıt olarak bu şartları kabul etmiş olursunuz.
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 border rounded-md text-sm leading-relaxed space-y-8 bg-muted/10">
          
          {/* 1. KULLANICI SÖZLEŞMESİ */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. KULLANICI SÖZLEŞMESİ</h2>
            <h3 className="font-bold mt-4">TARIMPAZAR.COM KULLANICI SÖZLEŞMESİ</h3>
            
            <h4 className="font-bold mt-4">MADDE 1: TARAFLAR</h4>
            <p>1.1. Site Sahibi: Bu sözleşmenin bir tarafında; [FİRMA/ŞAHIS TİCARİ UNVANI BURAYA GELECEK] (Bundan böyle kısaca "ŞİRKET" olarak anılacaktır) yer almaktadır.</p>
            <p>Adres: [Açık Adresiniz Buraya, SAKARYA]</p>
            <p>E-Posta: [iletisim@tarimpazar.com]</p>
            <p>1.2. Kullanıcı: Diğer tarafta; tarimpazar.com internet sitesine (Bundan böyle "SİTE" olarak anılacaktır) üye olan veya SİTE’yi ziyaret eden gerçek veya tüzel kişi (Bundan böyle "KULLANICI" olarak anılacaktır) yer almaktadır.</p>

            <h4 className="font-bold mt-4">MADDE 2: TANIMLAR</h4>
            <p>İşbu sözleşmede geçen;</p>
            <p>SİTE: tarimpazar.com alan adı ve buna bağlı alt alan adlarından oluşan web sitesini,</p>
            <p>ÜYE: SİTE'ye e-posta adresi ve şifre ile kayıt olan, SİTE'nin hizmetlerinden yararlanan kullanıcıyı,</p>
            <p>İÇERİK: SİTE'de yayınlanan her türlü görsel, yazı, video, ilan, fiyat bilgisi ve benzeri verileri ifade eder.</p>

            <h4 className="font-bold mt-4">MADDE 3: SÖZLEŞMENİN KONUSU VE KAPSAMI</h4>
            <p>İşbu sözleşmenin konusu; KULLANICI’nın SİTE’den faydalanma şartlarının ve tarafların karşılıklı hak ve yükümlülüklerinin belirlenmesidir. KULLANICI, SİTE’yi ziyaret ederek veya üye olarak işbu sözleşmenin tamamını okuduğunu, içeriğini bütünü ile anladığını ve tüm hükümlerini onayladığını kabul eder.</p>

            <h4 className="font-bold mt-4">MADDE 4: ÜYELİK ŞARTLARI</h4>
            <p>4.1. SİTE’ye üye olabilmek için reşit olmak (18 yaşını doldurmuş olmak) gerekmektedir.</p>
            <p>4.2. KULLANICI, üyelik formunda talep edilen bilgileri tam, doğru ve güncel olarak girmekle yükümlüdür. Bu bilgilerin eksik veya yanlış olmasından doğacak her türlü zarardan KULLANICI sorumludur.</p>
            <p>4.3. KULLANICI, hesabının güvenliğini sağlamakla yükümlüdür. Şifrenin üçüncü kişilerle paylaşılmasından doğacak sorumluluk tamamen KULLANICI’ya aittir.</p>

            <h4 className="font-bold mt-4">MADDE 5: HAK VE YÜKÜMLÜLÜKLER</h4>
            <p className="font-semibold">5.1. KULLANICI’nın Hak ve Yükümlülükleri:</p>
            <p>5.1.1. KULLANICI, SİTE üzerinde hukuka, genel ahlaka aykırı, başkalarını rahatsız edici, kişilik haklarını zedeleyici, telif haklarını ihlal edici içerik paylaşamaz.</p>
            <p>5.1.2. KULLANICI, SİTE’de satışa sunduğu veya sergilediği ürünlerin mülkiyetinin kendisine ait olduğunu, yasaklı veya kaçak ürün olmadığını taahhüt eder.</p>
            <p>5.1.3. KULLANICI, SİTE’nin yazılımına veya işleyişine zarar verecek (hack, virüs vb.) hiçbir faaliyette bulunamaz.</p>

            <p className="font-semibold mt-2">5.2. ŞİRKET’in Hak ve Yükümlülükleri:</p>
            <p>5.2.1. ŞİRKET, SİTE’de yer alan her türlü içeriği ve hizmeti önceden bildirimde bulunmaksızın değiştirme, durdurma veya yayından kaldırma hakkını saklı tutar.</p>
            <p>5.2.2. ŞİRKET, 5651 sayılı kanun uyarınca "Yer Sağlayıcı" konumundadır. KULLANICI’lar tarafından oluşturulan içeriklerin hukuka uygunluğunu denetleme yükümlülüğü yoktur, ancak şikayet üzerine içeriği kaldırma hakkına sahiptir.</p>
            <p>5.2.3. ŞİRKET, kullanıcılar arasındaki alışverişlerde taraf değildir; doğabilecek ticari uyuşmazlıklardan sorumlu tutulamaz.</p>

            <h4 className="font-bold mt-4">MADDE 6: GİZLİLİK VE KİŞİSEL VERİLER</h4>
            <p>ŞİRKET, KULLANICI’nın kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, SİTE’de yer alan "Aydınlatma Metni"ne uygun olarak işler ve saklar.</p>

            <h4 className="font-bold mt-4">MADDE 7: FİKRİ MÜLKİYET HAKLARI</h4>
            <p>SİTE’nin tasarımı, yazılımı, logosu ve ŞİRKET tarafından oluşturulan tüm içerikler ŞİRKET’in mülkiyetindedir. İzinsiz kopyalanamaz. KULLANICI, siteye yüklediği içeriklerin telif hakkının kendisine ait olduğunu kabul eder.</p>

            <h4 className="font-bold mt-4">MADDE 8: MÜCBİR SEBEPLER</h4>
            <p>Hukuken mücbir sebep sayılan durumlarda (doğal afet, savaş, altyapı arızaları vb.), ŞİRKET işbu sözleşmeden doğan yükümlülüklerini ifa edememekten dolayı sorumlu tutulamaz.</p>

            <h4 className="font-bold mt-4">MADDE 9: YETKİLİ MAHKEME</h4>
            <p>İşbu sözleşmeden doğacak uyuşmazlıklarda Türk Hukuku uygulanacak olup, SAKARYA Mahkemeleri ve İcra Daireleri yetkilidir.</p>

            <h4 className="font-bold mt-4">MADDE 10: YÜRÜRLÜK</h4>
            <p>İşbu sözleşme, KULLANICI’nın SİTE’yi kullanmaya başlaması veya üyelik işlemini tamamlaması ile yürürlüğe girer.</p>
          </section>

          {/* 2. KVKK AYDINLATMA METNİ */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 pt-8">2. KVKK AYDINLATMA METNİ</h2>
            <h3 className="font-bold mt-4">TARIMPAZAR.COM KİŞİSEL VERİLERİN KORUNMASI VE İŞLENMESİ HAKKINDA AYDINLATMA METNİ</h3>

            <h4 className="font-bold mt-4">1. VERİ SORUMLUSU</h4>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz; veri sorumlusu olarak [FİRMA/ŞAHIS TİCARİ UNVANI] (kısaca "Şirket" veya "tarimpazar.com") tarafından aşağıda açıklanan kapsamda işlenebilecektir.</p>

            <h4 className="font-bold mt-4">2. KİŞİSEL VERİLERİNİZİN İŞLENME AMACI</h4>
            <p>Toplanan kişisel verileriniz (Ad, soyad, telefon, e-posta, adres, IP adresi vb.);</p>
            <ul className="list-disc pl-5 mt-1">
                <li>Sitemiz üzerinden üyelik işlemlerinin yapılması,</li>
                <li>İlan ve ürün süreçlerinin yönetilmesi,</li>
                <li>Kullanıcılarla iletişim kurulması,</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi, amaçlarıyla işlenmektedir.</li>
            </ul>

            <h4 className="font-bold mt-4">3. KİŞİSEL VERİLERİN AKTARILMASI</h4>
            <p>Kişisel verileriniz; yasal zorunluluklar gereği yetkili kamu kurumlarına ve hizmetin sağlanabilmesi için teknik altyapı hizmeti aldığımız iş ortaklarımıza (Sunucu hizmeti vb.) KVKK şartlarına uygun olarak aktarılabilir.</p>

            <h4 className="font-bold mt-4">4. VERİ TOPLAMA YÖNTEMİ VE HUKUKİ SEBEP</h4>
            <p>Kişisel verileriniz, tarimpazar.com internet sitesi, üyelik formları ve çerezler aracılığıyla elektronik ortamda toplanmaktadır. Bu veriler "sözleşmenin kurulması/ifası" ve "meşru menfaat" hukuki sebeplerine dayalı olarak işlenir.</p>

            <h4 className="font-bold mt-4">5. HAKLARINIZ (KVKK MADDE 11)</h4>
            <p>Kişisel veri sahibi olarak Şirketimize başvurarak; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini isteme, silinmesini talep etme ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz.</p>
            <p className="mt-2">Taleplerinizi yazılı olarak [ADRESİNİZ, SAKARYA] adresine veya [iletisim@tarimpazar.com] mail adresine iletebilirsiniz.</p>
          </section>

          {/* 3. ÇEREZ POLİTİKASI */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 pt-8">3. ÇEREZ (COOKIE) POLİTİKASI</h2>
            <h3 className="font-bold mt-4">TARIMPAZAR.COM ÇEREZ POLİTİKASI</h3>

            <h4 className="font-bold mt-4">1. ÇEREZ NEDİR?</h4>
            <p>Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. tarimpazar.com olarak size daha iyi bir deneyim sunmak için çerez kullanıyoruz.</p>

            <h4 className="font-bold mt-4">2. KULLANILAN ÇEREZ TÜRLERİ</h4>
            <ul className="list-disc pl-5 mt-1">
                <li><strong>Zorunlu Çerezler:</strong> Sitenin çalışması ve güvenli giriş yapabilmeniz için gereklidir.</li>
                <li><strong>İşlevsel Çerezler:</strong> Tercihlerinizin (dil, beni hatırla vb.) hatırlanmasını sağlar.</li>
                <li><strong>Performans/Analiz Çerezleri:</strong> Sitenin ziyaretçi sayılarını ve kullanım trafiğini analiz etmemize yarar (Örn: Google Analytics).</li>
            </ul>

            <h4 className="font-bold mt-4">3. ÇEREZLERİN KULLANIM AMACI</h4>
            <p>Çerezler; kimliğinizi doğrulamak, oturumunuzu açık tutmak, site performansını artırmak ve size uygun hizmetler sunmak amacıyla kullanılır.</p>

            <h4 className="font-bold mt-4">4. ÇEREZ YÖNETİMİ</h4>
            <p>Tarayıcınızın ayarlarından çerezleri dilediğiniz zaman engelleyebilir veya silebilirsiniz. Ancak zorunlu çerezleri engellemeniz durumunda sitenin bazı fonksiyonları (örn: üye girişi) çalışmayabilir.</p>

            <h4 className="font-bold mt-4">5. YÜRÜRLÜK</h4>
            <p>Bu politika, sitede yayınlandığı tarihte yürürlüğe girer. Şirket, politikada değişiklik yapma hakkını saklı tutar.</p>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
}
