import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HomeIcon, Clock, Bed, Bath, ArrowRight } from 'lucide-react';
import { HouseData } from '@/services/houseService';

interface HouseCardProps {
  house: HouseData;
  index: number;
  formatPrice: (price: number) => string;
}

export default function HouseCard({ house, index, formatPrice }: HouseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/PreBuild/${house.id}`}>
        <div className="group relative h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Image with gradient overlay */}
          <div className="absolute inset-0">
            <Image
              src={house.imageUrl || '/placeholder-house.jpg'}
              alt={house.name}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 6}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {house.tipe}
              </span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-white/10 backdrop-blur-sm p-2 rounded-full"
              >
                <ArrowRight className="text-white" size={20} />
              </motion.div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                {house.name}
              </h3>
              <p className="text-gray-200 text-sm mb-4 line-clamp-2">
                {house.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-200">
                  <HomeIcon size={18} className="mr-2" />
                  <span>{house.luas} m²</span>
                </div>
                <div className="flex items-center text-gray-200">
                  <Clock size={18} className="mr-2" />
                  <span>{house.durasi} months</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-semibold text-xl">
                  {formatPrice(house.harga)}
                </span>
                <div className="flex items-center space-x-4 text-gray-200">
                  <div className="flex items-center">
                    <Bed size={16} className="mr-1" />
                    <span>{house.specifications.bedroomCount}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath size={16} className="mr-1" />
                    <span>{house.specifications.bathroomCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 