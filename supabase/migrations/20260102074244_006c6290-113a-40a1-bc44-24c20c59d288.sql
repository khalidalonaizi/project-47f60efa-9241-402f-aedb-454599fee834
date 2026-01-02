-- 1. إنشاء سياسات التخزين للتحكم في الوصول لصور العقارات
-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- تحديث الـ bucket ليكون خاصاً
UPDATE storage.buckets SET public = false WHERE id = 'property-images';

-- سياسة: يمكن للجميع مشاهدة صور العقارات المعتمدة فقط
CREATE POLICY "View approved property images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-images' 
  AND (
    -- السماح بمشاهدة صور العقارات المعتمدة
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE is_approved = true 
      AND images IS NOT NULL
      AND (storage.foldername(objects.name))[1] = user_id::text
    )
    OR
    -- السماح لصاحب العقار بمشاهدة صوره
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- السماح للمشرفين
    public.has_role(auth.uid(), 'admin')
  )
);

-- سياسة: المستخدمون المسجلون يمكنهم رفع الصور في مجلداتهم
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- سياسة: المستخدمون يمكنهم تحديث صورهم
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- سياسة: المستخدمون يمكنهم حذف صورهم
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);