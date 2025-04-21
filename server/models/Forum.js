const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    image: {
      type: String  // URL của hình ảnh đính kèm
    },
    imageData: {
      data: Buffer,
      contentType: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      url: String,
      type: String
    }]
  }],
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: {
      type: String
    },
    name: {
      type: String,
      default: 'image.jpg'
    },
    caption: String,
    data: {
      type: Buffer  // Lưu trữ dữ liệu nhị phân của hình ảnh
    },
    contentType: {
      type: String  // Loại nội dung của hình ảnh (ví dụ: image/jpeg, image/png)
    }
  }],
  videos: [{
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'video.mp4'
    }
  }],
  attachments: [{
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number
    },
    type: {
      type: String
    }
  }],
  likes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);