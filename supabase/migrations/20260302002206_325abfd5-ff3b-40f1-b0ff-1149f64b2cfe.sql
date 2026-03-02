-- Update the project-files bucket to allow larger file sizes (50GB) and all file types
UPDATE storage.buckets 
SET file_size_limit = 53687091200, -- 50GB in bytes
    allowed_mime_types = NULL -- Allow all file types
WHERE id = 'project-files';