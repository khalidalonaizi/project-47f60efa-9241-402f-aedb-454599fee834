const cities = [
  {
    id: 1,
    name: "الرياض",
    properties: 12500,
    image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "جدة",
    properties: 8200,
    image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "الدمام",
    properties: 4800,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "مكة المكرمة",
    properties: 3200,
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    name: "المدينة المنورة",
    properties: 2100,
    image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    name: "الخبر",
    properties: 1800,
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop",
  },
];

const CityGrid = () => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ar-SA").format(num);
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            استكشف المدن
          </h2>
          <p className="text-muted-foreground">
            ابحث عن عقارات في أكبر مدن المملكة
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city, index) => (
            <a
              key={city.id}
              href="#"
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 text-primary-foreground">
                <h3 className="text-lg font-bold mb-1">{city.name}</h3>
                <p className="text-sm opacity-90">
                  {formatNumber(city.properties)} عقار
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CityGrid;
