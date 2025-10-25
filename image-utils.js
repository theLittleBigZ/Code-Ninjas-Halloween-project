// Image utilities for compression and processing
export const imageUtils = {
    // Compress image to target size (default 45KB to stay under EmailJS 50KB limit)
    compressImage: async function(dataUrl, maxSizeKB = 45) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // If image is larger than 1200px in either dimension, scale it down
                const maxDimension = 1200;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Start with 0.9 quality
                let quality = 0.9;
                let dataURL = canvas.toDataURL('image/jpeg', quality);
                
                // Keep reducing quality until file size is under maxSizeKB
                while (dataURL.length > maxSizeKB * 1024 && quality > 0.1) {
                    quality -= 0.1;
                    dataURL = canvas.toDataURL('image/jpeg', quality);
                }
                
                resolve(dataURL);
            };
            img.src = dataUrl;
        });
    }
};