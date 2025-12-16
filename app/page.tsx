import Link from "next/link";
import Image from "next/image";
import { Coffee, Clock, Star, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function Home() {
  const features = [
    {
      icon: Coffee,
      title: "Kopi Pilihan",
      description: "Biji kopi premium dari berbagai daerah di Indonesia",
    },
    {
      icon: Clock,
      title: "Proses Cepat",
      description: "Pesanan siap dalam 10-15 menit",
    },
    {
      icon: Star,
      title: "Kualitas Terjamin",
      description: "Barista berpengalaman dan resep teruji",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pb-24 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Main Heading */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in shadow-lg shadow-primary/5">
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                   <Image src="/logo/logo.jpg" alt="Logo" fill className="object-cover" />
                </div>
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">Since 2024</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight tracking-tight">
                Nikmati Cita Rasa
                <br />
                <span className="text-primary bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                  Kopi Ceban
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Racikan kopi terbaik dari biji pilihan, disajikan dengan penuh dedikasi untuk setiap penikmat kopi sejati.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/pesan" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all group"
                >
                  Pesan Sekarang
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-border hover:bg-accent px-8 py-6 text-lg font-semibold"
                >
                  Lihat Menu
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto pt-12 sm:pt-16">
              <div className="text-center space-y-1 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Pelanggan Puas</div>
              </div>
              <div className="text-center space-y-1 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold text-primary">10+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Varian Menu</div>
              </div>
              <div className="col-span-2 sm:col-span-1 text-center space-y-1 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold text-primary">4.8★</div>
                <div className="text-sm sm:text-base text-muted-foreground">Rating Kualitas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
              Mengapa <span className="text-primary">Kopi Ceban?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Komitmen kami untuk memberikan pengalaman kopi terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white">
              Lokasi <span className="text-primary">Kopi Ceban</span>
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto text-base sm:text-lg">
              Temukan kami di sini dan rasakan kopi terbaik dengan harga bersahabat.
            </p>
          </div>

          {/* Maps Embed */}
          <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#2a2826] shadow-2xl shadow-black/40 hover:scale-[1.01] transition-all duration-300 group">
            <div className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15428.715329917913!2d105.2465243!3d-5.3819523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40db004e2f49db%3A0xda9692f932d6a00d!2sKopi%20Ceban%20panglima%20polim!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
            {/* Overlay for better aesthetics */}
            <div className="absolute inset-0 pointer-events-none border-2 border-primary/0 group-hover:border-primary/10 transition-all duration-300 rounded-2xl" />
          </div>

          {/* Address Info */}
          <div className="text-center bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
            <p className="text-neutral-300 text-sm sm:text-base">
              <span className="font-bold text-white">Alamat: </span>
              Panglima Polim, Bandar Lampung
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            Siap Menikmati Kopimu?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Pesan sekarang dan rasakan kehangatan setiap tegukan kopi pilihan kami.
          </p>
          <Link href="/pesan">
            <Button 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-xl font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
            >
              Mulai Pesan
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
