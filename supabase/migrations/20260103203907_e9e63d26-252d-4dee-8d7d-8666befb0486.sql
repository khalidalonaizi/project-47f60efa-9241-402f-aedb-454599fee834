-- 1. جدول تقييمات ومراجعات العقارات
CREATE TABLE public.property_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_id)
);

-- تفعيل RLS
ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للتقييمات
CREATE POLICY "Anyone authenticated can view reviews" 
ON public.property_reviews FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create reviews" 
ON public.property_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" 
ON public.property_reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" 
ON public.property_reviews FOR DELETE 
USING (auth.uid() = user_id);

-- 2. جدول الرسائل الداخلية
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للرسائل
CREATE POLICY "Users can view own messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own received messages" 
ON public.messages FOR UPDATE 
USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete own messages" 
ON public.messages FOR DELETE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 3. جدول تنبيهات الأسعار
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  city TEXT NOT NULL,
  max_price NUMERIC NOT NULL,
  property_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لتنبيهات الأسعار
CREATE POLICY "Users can view own alerts" 
ON public.price_alerts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create alerts" 
ON public.price_alerts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" 
ON public.price_alerts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" 
ON public.price_alerts FOR DELETE 
USING (auth.uid() = user_id);

-- تفعيل Realtime للرسائل
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;