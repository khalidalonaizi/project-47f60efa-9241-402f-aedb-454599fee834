import { Building2, MapPin, Star, Users } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "50,000+",
    label: "عقار متاح",
  },
  {
    icon: Users,
    value: "100,000+",
    label: "عميل سعيد",
  },
  {
    icon: MapPin,
    value: "50+",
    label: "مدينة",
  },
  {
    icon: Star,
    value: "4.9",
    label: "تقييم العملاء",
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-foreground/10 rounded-2xl flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-primary-foreground/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
