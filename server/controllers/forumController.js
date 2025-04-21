const ForumPost = require('../models/Forum');
const User = require('../models/User'); // Thêm import User model
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Cấu hình multer cho việc upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderName;
    
    // Xác định thư mục dựa trên loại file
    if (file.mimetype.startsWith('image')) {
      folderName = 'images';
    } else if (file.mimetype.startsWith('video')) {
      folderName = 'videos';
    } else {
      folderName = 'attachments';
    }
    
    // Tạo đường dẫn tuyệt đối đến thư mục uploads
    const uploadPath = path.resolve(__dirname, '..', 'uploads', folderName);
    
    console.log(`Đường dẫn tải lên: ${uploadPath} cho file ${file.originalname}`);
    
    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(uploadPath)) {
      console.log(`Tạo thư mục: ${uploadPath}`);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + path.extname(file.originalname);
    console.log(`Tên file được tạo: ${fileName}`);
    cb(null, fileName);
  }
});

// Giới hạn kích thước file (10MB)
const fileFilter = (req, file, cb) => {
  if (file.size > 10 * 1024 * 1024) {
    return cb(new Error('Kích thước file quá lớn. Tối đa 10MB.'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Cấu hình multer cho việc lưu trữ trong bộ nhớ (để lưu trực tiếp vào DB)
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Khai báo tất cả các hàm sẽ được xuất
const uploadFiles = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
  { name: 'attachments', maxCount: 5 }
]);

// Middleware để upload trực tiếp vào DB
const uploadFilesToDB = uploadToMemory.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
  { name: 'attachments', maxCount: 5 }
]);

// Cấu hình multer cho upload ảnh bình luận
const commentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tạo đường dẫn đến thư mục lưu ảnh bình luận
    const uploadPath = path.resolve(__dirname, '..', 'uploads', 'comments');
    
    console.log(`Đường dẫn tải lên ảnh bình luận: ${uploadPath}`);
    
    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(uploadPath)) {
      console.log(`Tạo thư mục comments: ${uploadPath}`);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + path.extname(file.originalname);
    console.log(`Tên file ảnh bình luận: ${fileName}`);
    cb(null, fileName);
  }
});

// Middleware để xử lý upload ảnh cho bình luận
const uploadCommentImage = multer({
  storage: commentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận file hình ảnh
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
    cb(null, true);
  }
}).single('commentImage'); // Tên field chứa file hình ảnh

// Cấu hình multer để upload ảnh bình luận vào memory (cho DB)
const uploadCommentImageToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
    cb(null, true);
  }
}).single('commentImage');

// Tạo bài viết mới
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, images, videos, attachments } = req.body;

    // Tạo bài viết mới
    const postData = {
      title,
      content,
      category,
      author: req.user ? req.user.id : req.body.authorId, // Hỗ trợ cả hai cách
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : []
    };

    // Thêm hình ảnh nếu có
    if (images) {
      postData.images = Array.isArray(images) ? images : JSON.parse(images);
    }

    // Thêm video nếu có
    if (videos) {
      postData.videos = Array.isArray(videos) ? videos : JSON.parse(videos);
    }

    // Thêm tệp đính kèm nếu có
    if (attachments) {
      postData.attachments = Array.isArray(attachments) ? attachments : JSON.parse(attachments);
    }

    const post = await ForumPost.create(postData);

    await post.populate('author', 'name username avatar');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Upload files riêng lẻ
const uploadMediaFiles = async (req, res) => {
  try {
    console.log('Bắt đầu xử lý tải lên file');
    
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('Không có file nào được gửi lên');
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được tải lên'
      });
    }
    
    const files = req.files;
    console.log('Files được gửi lên:', Object.keys(files).map(key => `${key}: ${files[key].length} file(s)`));
    
    const uploadResults = {
      images: [],
      videos: [],
      attachments: []
    };

    // Xử lý hình ảnh
    if (files.images) {
      console.log(`Đang xử lý ${files.images.length} hình ảnh`);
      files.images.forEach(file => {
        console.log(`Đã tải lên hình ảnh: ${file.originalname} -> ${file.filename}`);
        uploadResults.images.push({
          url: `/uploads/images/${file.filename}`,
          name: file.originalname,
          size: file.size
        });
      });
    }

    // Xử lý video
    if (files.videos) {
      console.log(`Đang xử lý ${files.videos.length} video`);
      files.videos.forEach(file => {
        console.log(`Đã tải lên video: ${file.originalname} -> ${file.filename}`);
        uploadResults.videos.push({
          url: `/uploads/videos/${file.filename}`,
          name: file.originalname,
          size: file.size
        });
      });
    }

    // Xử lý tệp đính kèm
    if (files.attachments) {
      console.log(`Đang xử lý ${files.attachments.length} tệp đính kèm`);
      files.attachments.forEach(file => {
        console.log(`Đã tải lên tệp đính kèm: ${file.originalname} -> ${file.filename}`);
        uploadResults.attachments.push({
          url: `/uploads/attachments/${file.filename}`,
          name: file.originalname,
          size: file.size,
          type: file.mimetype
        });
      });
    }

    console.log('Hoàn thành xử lý tải lên tệp', uploadResults);
    res.status(200).json({
      success: true,
      data: uploadResults
    });
  } catch (error) {
    console.error('Lỗi khi tải lên tệp:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lên tệp',
      error: error.message
    });
  }
};

// Upload files trực tiếp vào database
const uploadMediaFilesToDB = async (req, res) => {
  try {
    console.log('Bắt đầu xử lý tải lên file trực tiếp vào DB');
    
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('Không có file nào được gửi lên');
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được tải lên'
      });
    }
    
    const files = req.files;
    console.log('Files được gửi lên:', Object.keys(files).map(key => `${key}: ${files[key].length} file(s)`));
    
    const uploadResults = {
      images: [],
      videos: [],
      attachments: []
    };

    // Xử lý hình ảnh
    if (files.images) {
      console.log(`Đang xử lý ${files.images.length} hình ảnh`);
      files.images.forEach(file => {
        console.log(`Đã tải lên hình ảnh: ${file.originalname}`);
        uploadResults.images.push({
          name: file.originalname,
          size: file.size,
          data: file.buffer,
          contentType: file.mimetype
        });
      });
    }

    // Xử lý video
    if (files.videos) {
      console.log(`Đang xử lý ${files.videos.length} video`);
      files.videos.forEach(file => {
        console.log(`Đã tải lên video: ${file.originalname}`);
        uploadResults.videos.push({
          url: `/uploads/videos/${file.filename}`, // Vẫn lưu video dưới dạng file
          name: file.originalname,
          size: file.size
        });
      });
    }

    // Xử lý tệp đính kèm
    if (files.attachments) {
      console.log(`Đang xử lý ${files.attachments.length} tệp đính kèm`);
      files.attachments.forEach(file => {
        console.log(`Đã tải lên tệp đính kèm: ${file.originalname}`);
        uploadResults.attachments.push({
          url: `/uploads/attachments/${file.filename}`, // Vẫn lưu đính kèm dưới dạng file
          name: file.originalname,
          size: file.size,
          type: file.mimetype
        });
      });
    }

    console.log('Hoàn thành xử lý tải lên tệp vào DB');
    res.status(200).json({
      success: true,
      data: uploadResults
    });
  } catch (error) {
    console.error('Lỗi khi tải lên tệp vào DB:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lên tệp vào DB',
      error: error.message
    });
  }
};

// Lấy danh sách bài viết
const getPosts = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional: user might not be authenticated
    
    // Xử lý các tham số truy vấn
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    
    console.log(`Lấy danh sách bài viết với: page=${page}, limit=${limit}, category=${category || 'all'}, search=${search || 'none'}`);
    
    // Xây dựng query
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Lấy tổng số bài viết để tính pagination
    const total = await ForumPost.countDocuments(query);
    
    // Lấy danh sách bài viết theo các tiêu chí lọc
    const posts = await ForumPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username avatar')
      .populate('comments.author', 'name username avatar');
    
    // Add user-specific data to each post (if user is authenticated)
    const result = posts.map(post => {
      const postObj = post.toObject();
      if (userId) {
        // Check if this user has liked the post
        postObj.userLiked = post.likes.users.some(id => id.toString() === userId);
      }
      return postObj;
    });
    
    // Trả về kết quả với thông tin phân trang
    res.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy chi tiết bài viết theo ID
const getPostById = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?.id; // Optional: user might not be authenticated

    console.log(`Đang lấy chi tiết bài viết có ID: ${postId}`);

    // Tìm bài viết theo ID và populate thông tin author
    const post = await ForumPost.findById(postId)
      .populate('author', 'name username avatar bio')
      .populate('comments.author', 'name username avatar');

    // Nếu không tìm thấy bài viết
    if (!post) {
      console.log(`Không tìm thấy bài viết với ID: ${postId}`);
      return res.status(404).json({
        success: false, 
        message: 'Không tìm thấy bài viết hoặc bài viết đã bị xóa.'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Add user-specific data (if user is authenticated)
    let result = post.toObject();
    if (userId) {
      // Check if this user has liked the post
      result.userLiked = post.likes.users.some(id => id.toString() === userId);
    }

    console.log(`Đã tìm thấy bài viết: ${post.title}`);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết bài viết',
      error: error.message
    });
  }
};

// Tăng lượt xem bài viết
const incrementPostView = async (req, res) => {
  try {
    const postId = req.params.postId;
    console.log(`Tăng lượt xem cho bài viết ID: ${postId}`);
    
    // Tìm bài viết theo ID và tăng lượt xem
    const post = await ForumPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    // Tăng lượt xem hoặc khởi tạo nếu chưa có
    post.views = (post.views || 0) + 1;
    await post.save();
    
    console.log(`Bài viết ${postId} có ${post.views} lượt xem`);
    
    res.status(200).json({
      success: true,
      views: post.views
    });
  } catch (error) {
    console.error('Lỗi khi tăng lượt xem bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tăng lượt xem',
      error: error.message
    });
  }
};

// Thêm bình luận
const addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Tạo dữ liệu bình luận cơ bản
    const comment = {
      content: req.body.content || 'Đã gửi một hình ảnh', // Đặt nội dung mặc định nếu chỉ có ảnh
      author: req.user.id
    };

    // Thêm đường dẫn ảnh nếu có upload ảnh
    if (req.file) {
      // Nếu lưu vào filesystem
      comment.image = `/uploads/comments/${req.file.filename}`;
      
      // Nếu lưu vào DB trực tiếp
      if (req.body.storeInDB === 'true' && req.file.buffer) {
        comment.imageData = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }
    } else if (!req.body.content || req.body.content.trim() === '') {
      // Nếu không có nội dung và cũng không có ảnh, trả về lỗi
      return res.status(400).json({
        success: false,
        message: 'Bình luận phải có nội dung hoặc hình ảnh'
      });
    }

    console.log('Thêm bình luận mới:', comment);
    
    // Thêm bình luận vào bài viết
    post.comments.push(comment);
    await post.save();

    // Populate thông tin tác giả cho bình luận vừa thêm
    await post.populate('comments.author', 'name username avatar');

    // Lấy ra bình luận vừa thêm (phần tử cuối cùng trong mảng comments)
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Lỗi khi thêm bình luận:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm bình luận',
      error: error.message
    });
  }
};

// Thêm bình luận với ảnh lưu trong DB
const addCommentWithImageInDB = async (req, res) => {
  try {
    uploadCommentImageToMemory(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      const post = await ForumPost.findById(req.params.postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      // Tạo dữ liệu bình luận cơ bản
      const comment = {
        content: req.body.content || 'Đã gửi một hình ảnh', // Đặt nội dung mặc định nếu chỉ có ảnh
        author: req.user.id
      };

      // Thêm dữ liệu ảnh nếu có
      if (req.file) {
        comment.imageData = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      } else if (!req.body.content || req.body.content.trim() === '') {
        // Nếu không có nội dung và cũng không có ảnh, trả về lỗi
        return res.status(400).json({
          success: false,
          message: 'Bình luận phải có nội dung hoặc hình ảnh'
        });
      }

      console.log('Thêm bình luận mới với ảnh lưu DB:', {
        content: comment.content,
        hasImage: !!req.file
      });
      
      // Thêm bình luận vào bài viết
      post.comments.push(comment);
      await post.save();

      // Populate thông tin tác giả cho bình luận vừa thêm
      await post.populate('comments.author', 'name username avatar');

      // Lấy ra bình luận vừa thêm (phần tử cuối cùng trong mảng comments)
      const newComment = post.comments[post.comments.length - 1];

      res.status(201).json({
        success: true,
        data: newComment
      });
    });
  } catch (error) {
    console.error('Lỗi khi thêm bình luận với ảnh lưu DB:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm bình luận',
      error: error.message
    });
  }
};

// Cập nhật bài viết
const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, content, category, tags, images, videos, attachments } = req.body;
    
    // Tìm bài viết theo ID
    const post = await ForumPost.findById(postId);
    
    // Kiểm tra nếu bài viết tồn tại
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    // Kiểm tra quyền sở hữu - chỉ tác giả mới có thể sửa
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bài viết này'
      });
    }
    
    console.log('Đang cập nhật bài viết:', postId);
    console.log('Dữ liệu nhận được:', { title, content, category, images: images?.length || 0, videos: videos?.length || 0, attachments: attachments?.length || 0 });
    
    // Xử lý các file cũ đã bị xóa (so sánh file cũ và file mới)
    // Nếu có file cũ mà không có trong danh sách mới, xóa file khỏi server
    if (images) {
      const newImages = Array.isArray(images) ? images : JSON.parse(images);
      const newImageIds = newImages.map(img => img._id || img.id).filter(id => id);
      
      // Xóa các file hình ảnh đã bị loại bỏ
      const removedImages = post.images.filter(img => !newImageIds.includes(img._id.toString()));
      
      for (const image of removedImages) {
        if (image.url) {
          const filePath = path.join(__dirname, '..', image.url);
          if (fs.existsSync(filePath)) {
            console.log('Xóa file ảnh:', filePath);
            fs.unlinkSync(filePath);
          }
        }
      }
      
      // Cập nhật danh sách hình ảnh mới
      post.images = newImages;
    }
    
    // Xử lý tương tự cho videos
    if (videos) {
      const newVideos = Array.isArray(videos) ? videos : JSON.parse(videos);
      const newVideoIds = newVideos.map(vid => vid._id || vid.id).filter(id => id);
      
      const removedVideos = post.videos.filter(vid => !newVideoIds.includes(vid._id.toString()));
      
      for (const video of removedVideos) {
        if (video.url) {
          const filePath = path.join(__dirname, '..', video.url);
          if (fs.existsSync(filePath)) {
            console.log('Xóa file video:', filePath);
            fs.unlinkSync(filePath);
          }
        }
      }
      
      post.videos = newVideos;
    }
    
    // Xử lý tương tự cho attachments
    if (attachments) {
      const newAttachments = Array.isArray(attachments) ? attachments : JSON.parse(attachments);
      const newAttachmentIds = newAttachments.map(att => att._id || att.id).filter(id => id);
      
      const removedAttachments = post.attachments.filter(att => !newAttachmentIds.includes(att._id.toString()));
      
      for (const attachment of removedAttachments) {
        if (attachment.url) {
          const filePath = path.join(__dirname, '..', attachment.url);
          if (fs.existsSync(filePath)) {
            console.log('Xóa file đính kèm:', filePath);
            fs.unlinkSync(filePath);
          }
        }
      }
      
      post.attachments = newAttachments;
    }
    
    // Cập nhật thông tin bài viết
    post.title = title || post.title;
    post.content = content || post.content;
    if (category) post.category = category;
    if (tags) post.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    
    // Lưu lại bài viết
    const updatedPost = await post.save();
    await updatedPost.populate('author', 'name username avatar');
    
    res.json({
      success: true,
      data: updatedPost,
      message: 'Bài viết đã được cập nhật thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bài viết',
      error: error.message
    });
  }
};

// Xóa bài viết
const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Tìm bài viết theo ID
    const post = await ForumPost.findById(postId);
    
    // Kiểm tra nếu bài viết tồn tại
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    // Kiểm tra quyền - Cho phép admin hoặc chính tác giả xóa bài viết
    if (post.author.toString() !== req.user.id && !['admin', 'superAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này'
      });
    }
    
    // Xóa các file liên quan (hình ảnh, video, tệp đính kèm)
    if (post.images && post.images.length > 0) {
      post.images.forEach(image => {
        const filePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    if (post.videos && post.videos.length > 0) {
      post.videos.forEach(video => {
        const filePath = path.join(__dirname, '..', video.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    if (post.attachments && post.attachments.length > 0) {
      post.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // Xóa bài viết khỏi database - sử dụng deleteOne thay vì remove
    await ForumPost.deleteOne({ _id: postId });
    
    res.json({
      success: true,
      message: 'Bài viết đã được xóa thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bài viết',
      error: error.message
    });
  }
};

// Like a post
const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Find the post
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user already liked this post
    const alreadyLiked = post.likes.users.some(id => id.toString() === userId);
    
    if (alreadyLiked) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    // Add user to likes and increment count
    post.likes.users.push(userId);
    post.likes.count += 1;
    await post.save();

    return res.json({ 
      success: true, 
      likes: post.likes.count,
      message: 'Post liked successfully' 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// Unlike a post
const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Find the post
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user has liked this post
    const userLikeIndex = post.likes.users.findIndex(id => id.toString() === userId);
    
    if (userLikeIndex === -1) {
      return res.status(400).json({ msg: 'Post not liked yet' });
    }

    // Remove user from likes and decrement count
    post.likes.users.splice(userLikeIndex, 1);
    post.likes.count = Math.max(0, post.likes.count - 1); // Ensure count doesn't go below 0
    await post.save();

    return res.json({ 
      success: true, 
      likes: post.likes.count,
      message: 'Like removed successfully' 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// Lấy thống kê diễn đàn
const getForumStats = async (req, res) => {
  try {
    console.log('API getForumStats được gọi');
    
    // Đếm tổng số bài viết
    const totalPosts = await ForumPost.countDocuments();
    console.log('totalPosts:', totalPosts);
    
    // Đếm số bài viết mới trong tháng này
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newPostsThisMonth = await ForumPost.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });
    console.log('newPostsThisMonth:', newPostsThisMonth);
    
    // Lấy các bài viết phổ biến nhất (có nhiều lượt xem nhất)
    const popularPosts = await ForumPost.find()
      .sort({ views: -1 })
      .limit(5)
      .populate('author', 'name avatar');
    console.log('popularPosts count:', popularPosts.length);
    
    // Đếm tổng số lượt xem, bình luận
    const totalStats = await ForumPost.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalComments: { $sum: { $size: '$comments' } },
          totalLikes: { $sum: { $size: '$likes.users' } }
        }
      }
    ]);
    console.log('totalStats:', totalStats);
    
    // Đếm số lượng danh mục (giả sử dùng hệ thống tag làm danh mục)
    const categories = await ForumPost.distinct('category');
    console.log('categories:', categories);
    
    const totalCategories = categories.length;
    
    // Đếm số bài viết theo người dùng (top contributors)
    const topContributors = await ForumPost.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 }
        }
      },
      { $sort: { postCount: -1 } },
      { $limit: 5 }
    ]);
    console.log('topContributors count:', topContributors.length);
    
    // Lấy thông tin người dùng cho top contributors
    const populatedContributors = await User.populate(topContributors, {
      path: '_id',
      select: 'name avatar'
    });
    
    const contributors = populatedContributors.map(item => ({
      user: item._id,
      postCount: item.postCount
    }));
    
    const result = {
      success: true,
      totalPosts,
      newPostsThisMonth,
      popularPosts,
      totalViews: totalStats.length > 0 ? totalStats[0].totalViews : 0,
      totalComments: totalStats.length > 0 ? totalStats[0].totalComments : 0,
      totalLikes: totalStats.length > 0 ? totalStats[0].totalLikes : 0,
      totalCategories,
      contributors
    };
    
    console.log('Kết quả thống kê:', { 
      totalPosts, 
      newPostsThisMonth,
      totalCategories,
      popularPostsCount: popularPosts.length,
      topContributorsCount: topContributors.length
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting forum statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê diễn đàn',
      error: error.message,
      stack: error.stack // Thêm stack trace để debug chi tiết hơn
    });
  }
};

// Export tất cả các hàm với một cách thống nhất
module.exports = {
  uploadFiles,
  uploadFilesToDB,
  uploadCommentImage,
  createPost,
  uploadMediaFiles,
  uploadMediaFilesToDB,
  getPosts,
  getPostById,
  incrementPostView,
  addComment,
  addCommentWithImageInDB,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getForumStats
};