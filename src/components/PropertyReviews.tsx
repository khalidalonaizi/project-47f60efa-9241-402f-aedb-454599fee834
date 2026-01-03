import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PropertyReviewsProps {
  propertyId: string;
}

interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["property-reviews", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_reviews")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!user,
  });

  const { data: userReview } = useQuery({
    queryKey: ["user-review", propertyId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("property_reviews")
        .select("*")
        .eq("property_id", propertyId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("يجب تسجيل الدخول");
      
      const { error } = await supabase.from("property_reviews").insert({
        property_id: propertyId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-reviews", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", propertyId] });
      setComment("");
      setRating(5);
      toast.success("تم إضافة تقييمك بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة التقييم");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("property_reviews")
        .delete()
        .eq("id", reviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-reviews", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", propertyId] });
      toast.success("تم حذف التقييم");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف التقييم");
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const StarRating = ({ value, interactive = false, size = "w-5 h-5" }: { value: number; interactive?: boolean; size?: string }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} cursor-${interactive ? "pointer" : "default"} transition-colors ${
            star <= (interactive ? (hoveredRating || rating) : value)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoveredRating(star)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">سجل دخولك لرؤية وإضافة التقييمات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ملخص التقييمات */}
      <div className="flex items-center gap-4 bg-muted/30 rounded-lg p-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</div>
          <StarRating value={Math.round(averageRating)} />
          <div className="text-sm text-muted-foreground mt-1">{reviews.length} تقييم</div>
        </div>
      </div>

      {/* نموذج إضافة تقييم */}
      {!userReview && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold">أضف تقييمك</h4>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">التقييم</label>
            <StarRating value={rating} interactive size="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">تعليقك (اختياري)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا رأيك عن هذا العقار..."
              className="resize-none"
              rows={3}
            />
          </div>
          <Button
            onClick={() => createReviewMutation.mutate()}
            disabled={createReviewMutation.isPending}
          >
            {createReviewMutation.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
        </div>
      )}

      {/* قائمة التقييمات */}
      <div className="space-y-4">
        <h4 className="font-semibold">التقييمات ({reviews.length})</h4>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">جاري التحميل...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">لا توجد تقييمات بعد</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-card border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), "dd MMM yyyy", { locale: ar })}
                  </span>
                </div>
                {user?.id === review.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReviewMutation.mutate(review.id)}
                    disabled={deleteReviewMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyReviews;
