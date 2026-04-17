"use client";

const categories = [
  {
    name: "Just Chatting",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  },
  {
    name: "Gaming",
    img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
  },
  {
    name: "IRL",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
  {
    name: "Music",
    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
  },
  {
    name: "Tech",
    img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
  },
  {
    name: "Esports",
    img: "https://images.unsplash.com/photo-1605902711622-cfb43c44367f",
  },
];

export default function Categories() {
  return (
    <div className="px-12 mt-10">
      <h2 className="text-2xl font-black mb-6">Top Live Categories</h2>

      <div className="grid grid-cols-6 gap-6">
        {categories.map((c, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden group cursor-pointer"
          >
            <div
              className="h-[140px] bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${c.img})` }}
            />

            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />

            <div className="absolute bottom-2 left-3 text-sm font-bold">
              {c.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
