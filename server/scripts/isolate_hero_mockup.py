import cv2
import numpy as np
from PIL import Image

def isolate_book():
    img_bgr = cv2.imread('client/public/images/hero-catalogue-clean.jpg')
    h, w = img_bgr.shape[:2]
    print(f"Loaded image: {w}x{h}")

    # Use GrabCut to accurately segment foreground object (the open book)
    # The book is roughly in the center: [margin_x, margin_y, w - 2*margin_x, h - 2*margin_y]
    mask = np.zeros((h, w), np.uint8)
    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)

    rect = (int(w * 0.08), int(h * 0.08), int(w * 0.84), int(h * 0.84))
    print("Running GrabCut segmentation...")
    cv2.grabCut(img_bgr, mask, rect, bgdModel, fgdModel, 4, cv2.GC_INIT_WITH_RECT)

    # Where mask == 2 or 0 -> background, where 1 or 3 -> foreground
    mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')

    # Convert to float and apply gentle blur to edge for natural feathering
    mask_float = mask2.astype(np.float32)
    mask_blurred = cv2.GaussianBlur(mask_float, (15, 15), 0)

    # Create RGBA image
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = img_rgb
    rgba[:, :, 3] = (mask_blurred * 255).astype(np.uint8)

    # Save transparent PNG
    out_img = Image.fromarray(rgba, 'RGBA')
    out_img.save('client/public/images/hero-catalogue-transparent.png')
    print("Saved client/public/images/hero-catalogue-transparent.png successfully!")

isolate_book()
