'use client';

import { motion } from 'framer-motion';
import {
  TrainFront,
  Hospital,
  UtensilsCrossed,
  ShoppingBag,
  TreePine,
  Dumbbell,
  Landmark,
  Pill,
  MapPin,
  Navigation,
  Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NEARBY_SERVICES } from '@/lib/constants';

const ICON_MAP: Record<string, React.ElementType> = {
  TrainFront,
  Hospital,
  UtensilsCrossed,
  ShoppingBag,
  TreePine,
  Dumbbell,
  Landmark,
  Pill,
};

const SERVICE_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  'Metro Station': { bg: 'bg-brand-teal/10', text: 'text-brand-teal', iconBg: 'bg-brand-teal/15' },
  Hospitals: { bg: 'bg-destructive/10', text: 'text-destructive', iconBg: 'bg-destructive/15' },
  Restaurants: { bg: 'bg-brand-teal/10', text: 'text-brand-teal', iconBg: 'bg-brand-teal/15' },
  'Shopping Malls': { bg: 'bg-chart-3/10', text: 'text-chart-3', iconBg: 'bg-chart-3/15' },
  Parks: { bg: 'bg-brand-lime/15', text: 'text-brand-lime', iconBg: 'bg-brand-lime/20' },
  Gyms: { bg: 'bg-brand-sage/10', text: 'text-brand-sage', iconBg: 'bg-brand-sage/15' },
  'Banks & ATMs': { bg: 'bg-brand-teal/10', text: 'text-brand-teal', iconBg: 'bg-brand-teal/15' },
  Pharmacies: { bg: 'bg-chart-5/10', text: 'text-chart-5', iconBg: 'bg-chart-5/15' },
};

function BangaloreMapPlaceholder() {
  return (
    <div className="relative w-full bg-gradient-to-br from-brand-lime/10 via-brand-teal-light to-brand-teal/10 rounded-2xl overflow-hidden border border-brand-lime/20 min-h-[400px]">
      {/* Grid pattern to simulate map */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#065f46" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Simulated roads */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Main roads */}
        <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
        <line x1="10%" y1="60%" x2="90%" y2="60%" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
        <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
        <line x1="60%" y1="10%" x2="60%" y2="90%" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
        <line x1="15%" y1="15%" x2="85%" y2="85%" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
        <line x1="85%" y1="15%" x2="15%" y2="85%" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />

        {/* Ring road */}
        <ellipse cx="50%" cy="48%" rx="35%" ry="32%" fill="none" stroke="#d1d5db" strokeWidth="3" strokeDasharray="8 4" />

        {/* Parks (green areas) */}
        <ellipse cx="45%" cy="45%" rx="8%" ry="6%" fill="#86efac" opacity="0.3" />
        <ellipse cx="72%" cy="30%" rx="5%" ry="4%" fill="#86efac" opacity="0.3" />
        <circle cx="25%" cy="70%" r="4%" fill="#86efac" opacity="0.3" />
      </svg>

      {/* Location pins */}
      {[
        { x: '45%', y: '42%', label: 'Your Location', type: 'you' },
        { x: '30%', y: '28%', label: 'Metro', type: 'metro' },
        { x: '60%', y: '55%', label: 'Hospital', type: 'hospital' },
        { x: '75%', y: '30%', label: 'Mall', type: 'mall' },
        { x: '25%', y: '60%', label: 'Park', type: 'park' },
        { x: '55%', y: '20%', label: 'Restaurant', type: 'food' },
        { x: '70%', y: '70%', label: 'ATM', type: 'bank' },
        { x: '40%', y: '75%', label: 'Pharmacy', type: 'pharmacy' },
      ].map((pin, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
          className="absolute flex flex-col items-center"
          style={{ left: pin.x, top: pin.y }}
        >
          <div
            className={`size-6 rounded-full flex items-center justify-center shadow-md ${
              pin.type === 'you'
                ? 'bg-brand-teal ring-4 ring-brand-teal/30'
                : 'bg-card border-2 border-border'
            }`}
          >
            <MapPin
              className={`size-3 ${pin.type === 'you' ? 'text-white' : 'text-muted-foreground'}`}
            />
          </div>
          <span
            className={`text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded ${
              pin.type === 'you'
                ? 'bg-brand-teal text-white'
                : 'bg-card/90 text-muted-foreground shadow-sm'
            }`}
          >
            {pin.label}
          </span>
        </motion.div>
      ))}

      {/* Compass */}
      <div className="absolute top-4 right-4 bg-card/90 rounded-xl p-2 shadow-sm">
        <Navigation className="size-5 text-muted-foreground" />
      </div>

      {/* Scale */}
      <div className="absolute bottom-4 left-4 bg-card/90 rounded-lg px-2 py-1 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="w-12 h-0.5 bg-muted-foreground/50 relative">
            <div className="absolute left-0 -top-1 w-px h-2 bg-muted-foreground/50" />
            <div className="absolute right-0 -top-1 w-px h-2 bg-muted-foreground/50" />
          </div>
          500m
        </div>
      </div>
    </div>
  );
}

export default function NearbyServices() {
  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 bg-brand-teal/15 rounded-xl flex items-center justify-center">
              <MapPin className="size-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nearby Services</h1>
              <p className="text-sm text-muted-foreground">Explore essential services near your PG</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Map Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BangaloreMapPlaceholder />
        </motion.div>

        {/* Service Categories Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Navigation className="size-5 text-brand-teal" />
            Service Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {NEARBY_SERVICES.map((service, index) => {
              const Icon = ICON_MAP[service.icon] || MapPin;
              const colors = SERVICE_COLORS[service.name] || {
                bg: 'bg-muted',
                text: 'text-muted-foreground',
                iconBg: 'bg-muted',
              };

              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${colors.bg}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg}`}
                      >
                        <Icon className={`size-6 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{service.name}</div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {service.count} nearby
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Popular Nearby */}
        <Card className="border-0 shadow-sm">
          <div className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Popular Places Nearby</h3>
            <div className="space-y-3">
              {[
                {
                  name: 'MG Road Metro Station',
                  type: 'Metro',
                  distance: '0.8 km',
                  rating: 4.5,
                  icon: TrainFront,
                  color: 'text-brand-teal bg-brand-teal/10',
                },
                {
                  name: 'Apollo Hospital',
                  type: 'Hospital',
                  distance: '1.2 km',
                  rating: 4.3,
                  icon: Hospital,
                  color: 'text-destructive bg-destructive/10',
                },
                {
                  name: 'Truffles Restaurant',
                  type: 'Restaurant',
                  distance: '0.5 km',
                  rating: 4.6,
                  icon: UtensilsCrossed,
                  color: 'text-brand-teal bg-brand-teal/10',
                },
                {
                  name: 'Phoenix Mall',
                  type: 'Shopping',
                  distance: '2.1 km',
                  rating: 4.4,
                  icon: ShoppingBag,
                  color: 'text-chart-3 bg-chart-3/10',
                },
                {
                  name: 'Cubbon Park',
                  type: 'Park',
                  distance: '1.5 km',
                  rating: 4.7,
                  icon: TreePine,
                  color: 'text-brand-lime bg-brand-lime/15',
                },
              ].map((place, i) => {
                const PlaceIcon = place.icon;
                return (
                  <motion.div
                    key={place.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className={`size-10 rounded-xl flex items-center justify-center ${place.color}`}>
                      <PlaceIcon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{place.name}</div>
                      <div className="text-xs text-muted-foreground">{place.type}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        {place.distance}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-brand-sage">
                        <Star className="size-3 fill-brand-sage text-brand-sage" />
                        {place.rating}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
