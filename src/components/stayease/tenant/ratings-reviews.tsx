'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  Flag,
  User,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/lib/toast';
import { BADGE, AVATARS } from '@/lib/constants';
import type { Review } from '@/lib/types';
import { fadeIn, scaleIn, staggerContainer, staggerItem } from '@/lib/animations';

// ---- MOCK DATA ----

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    pgId: 'pg1',
    userId: 'u1',
    userName: 'Arjun K.',
    userAvatar: AVATARS[0],
    rating: 5,
    comment: 'Absolutely fantastic PG! The rooms are spacious, clean, and well-maintained. The food quality is excellent and the warden is very supportive. WiFi is super fast which is great for work-from-home. Highly recommended for anyone looking for a premium stay in Koramangala.',
    cleanliness: 5,
    safety: 5,
    valueForMoney: 4,
    amenities: 5,
    management: 5,
    createdAt: '2025-01-10T14:30:00Z',
  },
  {
    id: 'r2',
    pgId: 'pg1',
    userId: 'u2',
    userName: 'Priya M.',
    userAvatar: AVATARS[1],
    rating: 4,
    comment: 'Good PG overall. The location is perfect - close to metro and many restaurants. Rooms are decent but could be a bit bigger. The common area is nicely maintained. Food is average but they do offer variety. Security is top-notch with CCTV and guards 24/7.',
    cleanliness: 4,
    safety: 5,
    valueForMoney: 3,
    amenities: 4,
    management: 4,
    createdAt: '2025-01-05T09:15:00Z',
  },
  {
    id: 'r3',
    pgId: 'pg1',
    userId: 'u3',
    userName: 'Rahul S.',
    userAvatar: AVATARS[2],
    rating: 4,
    comment: 'Been staying here for 6 months now and it has been a great experience. The management is responsive to complaints and fixes issues quickly. The gym is well-equipped and the laundry service is reliable. Only downside is the water pressure in bathrooms could be better.',
    cleanliness: 4,
    safety: 4,
    valueForMoney: 4,
    amenities: 4,
    management: 5,
    createdAt: '2024-12-28T18:45:00Z',
  },
  {
    id: 'r4',
    pgId: 'pg1',
    userId: 'u4',
    userName: 'Sneha R.',
    userAvatar: AVATARS[3],
    rating: 5,
    comment: 'Best PG I have stayed in Bangalore! The owner genuinely cares about tenants. They organized a Diwali party and monthly game nights which makes it feel like a community. The study room is a huge plus for students. AC works perfectly even in summer.',
    cleanliness: 5,
    safety: 5,
    valueForMoney: 5,
    amenities: 5,
    management: 5,
    createdAt: '2024-12-20T11:00:00Z',
  },
  {
    id: 'r5',
    pgId: 'pg1',
    userId: 'u5',
    userName: 'Meera J.',
    userAvatar: AVATARS[4],
    rating: 3,
    comment: 'Decent PG for the price point. The location is good and safety is maintained well. However, the food quality has declined in the last couple of months. The WiFi sometimes drops during peak hours. Management should look into these issues.',
    cleanliness: 3,
    safety: 4,
    valueForMoney: 3,
    amenities: 3,
    management: 3,
    createdAt: '2024-12-15T16:20:00Z',
  },
];

const CATEGORY_LABELS = [
  { key: 'cleanliness' as const, label: 'Cleanliness' },
  { key: 'safety' as const, label: 'Safety' },
  { key: 'valueForMoney' as const, label: 'Value for Money' },
  { key: 'amenities' as const, label: 'Amenities' },
  { key: 'management' as const, label: 'Management' },
];

// ---- COMPONENT ----

export default function RatingsReviews({ pgId }: { pgId: string }) {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({
    r1: 24, r2: 12, r3: 8, r4: 31, r5: 5,
  });
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  // Write review state
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 3,
    safety: 3,
    valueForMoney: 3,
    amenities: 3,
    management: 3,
  });
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Computed stats
  const stats = useMemo(() => {
    const reviews = MOCK_REVIEWS;
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const avgCategories = {
      cleanliness: totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.cleanliness, 0) / totalReviews : 0,
      safety: totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.safety, 0) / totalReviews : 0,
      valueForMoney: totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.valueForMoney, 0) / totalReviews : 0,
      amenities: totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.amenities, 0) / totalReviews : 0,
      management: totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.management, 0) / totalReviews : 0,
    };

    // Rating distribution
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
      percentage: totalReviews > 0
        ? Math.round((reviews.filter((r) => r.rating === star).length / totalReviews) * 100)
        : 0,
    }));

    return { totalReviews, avgRating, avgCategories, distribution };
  }, []);

  const handleHelpful = (reviewId: string) => {
    if (helpfulClicked[reviewId]) return;
    setHelpfulCounts((prev) => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
    setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
    toast.success('Thanks for your feedback!');
  };

  const handleReport = () => {
    toast.info('Report submitted. Our team will review this review.');
  };

  const handleSubmitReview = () => {
    if (overallRating === 0) {
      toast.error('Please select an overall rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setShowConfetti(true);
      toast.success('Review submitted successfully! Thank you for your feedback.');

      setTimeout(() => {
        setShowConfetti(false);
        setShowWriteReview(false);
        setOverallRating(0);
        setReviewText('');
        setCategoryRatings({
          cleanliness: 3,
          safety: 3,
          valueForMoney: 3,
          amenities: 3,
          management: 3,
        });
      }, 2000);
    }, 1500);
  };

  const formatStar = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.3;
    return { fullStars, hasHalf };
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'lg' ? 'size-6' : size === 'md' ? 'size-4' : 'size-3.5';
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.round(rating);
      return (
        <Star
          key={i}
          className={`${sizeClass} ${
            filled
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <Trophy className="size-8" />
              <div>
                <p className="font-bold text-lg">Review Submitted!</p>
                <p className="text-sm text-green-100">Thank you for sharing your experience</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Section */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Overall Rating */}
              <div className="flex flex-col items-center sm:items-start gap-1 shrink-0">
                <motion.div
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-foreground">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {renderStars(stats.avgRating, 'lg')}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {stats.totalReviews} reviews
                  </p>
                </motion.div>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2.5 min-w-0">
                {stats.distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="text-sm font-medium text-foreground">{d.star}</span>
                      <Star className="size-3 text-amber-400 fill-amber-400" />
                    </div>
                    <Progress
                      value={d.percentage}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                      {d.count} ({d.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Ratings */}
            <Separator className="my-5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Category Ratings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CATEGORY_LABELS.map((cat) => (
                  <div
                    key={cat.key}
                    className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm text-muted-foreground">{cat.label}</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(stats.avgCategories[cat.key] / 5) * 100}
                        className="h-1.5 w-16"
                      />
                      <span className="text-sm font-semibold text-foreground w-6 text-right">
                        {stats.avgCategories[cat.key].toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Write Review Button */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible">
        {!showWriteReview ? (
          <Button
            onClick={() => setShowWriteReview(true)}
            variant="outline"
            className="w-full h-12 border-dashed border-2 border-brand-teal/30 hover:border-brand-teal/50 hover:bg-brand-teal/5 text-brand-teal gap-2 font-medium"
          >
            <Send className="size-4" />
            Write a Review
          </Button>
        ) : (
          <Card className="border-0 shadow-sm border-l-4 border-l-brand-teal">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-brand-teal" />
                Write Your Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Overall Star Rating */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Overall Rating</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setOverallRating(i + 1)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`size-7 transition-colors ${
                          i < (hoverRating || overallRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {overallRating > 0 && (
                    <span className="ml-2 text-sm font-medium text-foreground">
                      {overallRating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Category Sliders */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">Rate Each Category</p>
                {CATEGORY_LABELS.map((cat) => (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{cat.label}</span>
                      <span className="text-xs font-semibold text-foreground">
                        {categoryRatings[cat.key]}/5
                      </span>
                    </div>
                    <Slider
                      value={[categoryRatings[cat.key]]}
                      onValueChange={([val]) =>
                        setCategoryRatings((prev) => ({ ...prev, [cat.key]: val }))
                      }
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Your Review</p>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience living at this PG..."
                  rows={4}
                  maxLength={1000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {reviewText.length}/1000
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWriteReview(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="flex-1 bg-brand-teal hover:bg-brand-deep text-white gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Send className="size-4" />
                      </motion.div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Reviews List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <h3 className="text-base font-semibold text-foreground">
          Recent Reviews ({MOCK_REVIEWS.length})
        </h3>

        {MOCK_REVIEWS.map((review, index) => {
          const isExpanded = expandedReview === review.id;
          const isLong = review.comment.length > 200;

          return (
            <motion.div
              key={review.id}
              variants={staggerItem}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 ring-2 ring-brand-teal/10">
                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                        <AvatarFallback className="bg-brand-teal/10 text-brand-teal text-sm font-semibold">
                          {review.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {review.userName}
                          </p>
                          {review.rating >= 5 && (
                            <Badge className={`${BADGE.green} text-[10px] border-0 px-1.5 py-0`}>
                              Top Reviewer
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {renderStars(review.rating, 'sm')}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="mt-3">
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {isExpanded || !isLong
                        ? review.comment
                        : review.comment.slice(0, 200) + '...'}
                    </p>
                    {isLong && (
                      <button
                        onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                        className="text-xs text-brand-teal hover:underline mt-1 font-medium"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Category Breakdown */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CATEGORY_LABELS.map((cat) => (
                      <span
                        key={cat.key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {cat.label}: {review[cat.key]}/5
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        helpfulClicked[review.id]
                          ? 'bg-brand-teal/10 text-brand-teal'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <ThumbsUp className={`size-3 ${helpfulClicked[review.id] ? 'fill-brand-teal' : ''}`} />
                      Helpful ({helpfulCounts[review.id] || 0})
                    </button>
                    <button
                      onClick={handleReport}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Flag className="size-3" />
                      Report
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
