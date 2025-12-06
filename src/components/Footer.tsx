import { Building2, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Button } from "./ui/button";

const Footer = () => {
  const footerLinks = {
    company: [
      { label: "من نحن", href: "#" },
      { label: "وظائف", href: "#" },
      { label: "المدونة", href: "#" },
      { label: "اتصل بنا", href: "#" },
    ],
    services: [
      { label: "بيع العقارات", href: "#" },
      { label: "تأجير العقارات", href: "#" },
      { label: "التمويل العقاري", href: "#" },
      { label: "تقييم العقارات", href: "#" },
    ],
    support: [
      { label: "مركز المساعدة", href: "#" },
      { label: "الأسئلة الشائعة", href: "#" },
      { label: "سياسة الخصوصية", href: "#" },
      { label: "الشروط والأحكام", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">اشترك في نشرتنا البريدية</h3>
              <p className="text-background/70">احصل على أحدث العروض والعقارات المميزة</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 md:w-72 h-12 px-4 rounded-lg bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="hero" size="lg">
                اشتراك
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">عقارات</span>
            </div>
            <p className="text-background/70 mb-6 max-w-sm">
              منصتك الأولى للبحث عن العقارات في المملكة العربية السعودية. نوفر لك أكثر من 50,000 عقار في جميع المناطق.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4" />
                <span>920000000</span>
              </div>
              <div className="flex items-center gap-2 text-background/70">
                <Mail className="w-4 h-4" />
                <span>info@aqarat.sa</span>
              </div>
              <div className="flex items-center gap-2 text-background/70">
                <MapPin className="w-4 h-4" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">الشركة</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">خدماتنا</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">الدعم</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-background/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/50 text-sm">
              © 2024 عقارات. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
