import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Send, 
  Building2,
  Clock,
  MapPin,
  ExternalLink
} from "lucide-react";

interface ContactButtonProps {
  companyName?: string;
  companyPhone?: string;
  companyEmail?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

const ContactButton = ({
  companyName,
  companyPhone,
  companyEmail,
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
}: ContactButtonProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);

    toast({
      title: "تم الإرسال بنجاح",
      description: "سيتم التواصل معك قريباً",
    });

    setFormData({ name: "", phone: "", email: "", message: "" });
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => setOpen(true)}
      >
        {showIcon && <MessageCircle className="w-4 h-4 ml-2" />}
        تواصل معنا
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="block">تواصل معنا</span>
                {companyName && (
                  <span className="text-sm font-normal text-muted-foreground">{companyName}</span>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              اترك بياناتك وسنتواصل معك في أقرب وقت
            </DialogDescription>
          </DialogHeader>

          {/* Quick Contact Options */}
          <div className="flex gap-2 mb-4">
            {companyPhone && (
              <a href={`tel:${companyPhone}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  اتصال مباشر
                </Button>
              </a>
            )}
            {companyEmail && (
              <a href={`mailto:${companyEmail}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  بريد إلكتروني
                </Button>
              </a>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>متاحون من الأحد للخميس، 9 صباحاً - 6 مساءً</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>الرياض، المملكة العربية السعودية</span>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">الاسم *</Label>
                <Input
                  id="contact-name"
                  placeholder="اسمك الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">رقم الجوال *</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">البريد الإلكتروني</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">رسالتك</Label>
              <Textarea
                id="contact-message"
                placeholder="اكتب رسالتك هنا..."
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={sending}>
              {sending ? (
                "جاري الإرسال..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال الرسالة
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactButton;
