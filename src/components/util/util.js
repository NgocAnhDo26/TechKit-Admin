import { cloudinary } from '../../config/config.js';
// Get url image from cloudinary
export const getUrl = (address) =>
  cloudinary.url(address, {
    fetch_format: 'auto',
    quality: 'auto',
  });

// Upload image to cloudinary
export const uploadImage = async (address, folder) =>
  await cloudinary.uploader
    .upload(address, {
      ...(folder && { folder: folder }), // If folder is not null, add folder to upload
      public_id: 'category_gaming',
    })
    .catch((error) => {
      console.log(error);
    });

export const getImage = (public_id) => ({
  url: getUrl(public_id),
  public_id: public_id,
});

export const errorResponse = (status, message) => `
  <main style="text-align: center; margin-top: 100px; font-family: Arial, sans-serif;">
    <h1 style="font-size: 72px; color: #f44336; margin-bottom: 20px;">${status}</h1>
    <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 40px; color: #333;">Oops! Đã có lỗi xảy ra</h1>
    <p style="font-size: 18px; color: #666; margin-bottom: 20px;">${message}</p>
    <a href="/" 
      style="color: #f44336; text-decoration: none; font-size: 16px; transition: all 0.3s ease;"
      onmouseover="this.style.opacity='0.8'; this.style.textDecoration='underline';"
      onmouseout="this.style.opacity='1'; this.style.textDecoration='none';">
      Quay trở về trang chủ
    </a>
  </main>
`;
