import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Alert, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;

const StudentList = () => {
  const { authState } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [form] = Form.useForm();
  
  // Check admin permissions
  const canCreate = authState?.user?.role === 'superAdmin' || 
                    (authState?.user?.permissions?.createStudent);
  const canEdit = authState?.user?.role === 'superAdmin' || 
                 (authState?.user?.permissions?.editStudent);
  const canDelete = authState?.user?.role === 'superAdmin' || 
                   (authState?.user?.permissions?.deleteStudent);

  // Create fetchStudents with useCallback to prevent recreation on each render
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!authState?.token) {
        setError('Bạn cần đăng nhập để xem danh sách sinh viên');
        setLoading(false);
        return;
      }
      
      console.log('Gọi API với token:', authState.token.substring(0, 10) + '...');
      
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      
      if (response.data && response.data.data) {
        setStudents(response.data.data);
      } else {
        setError('Định dạng dữ liệu không hợp lệ từ server');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sinh viên:', error);
      
      const errorMsg = 
        error.response?.status === 404 ? 'API không tồn tại. Vui lòng kiểm tra cấu hình server' :
        error.response?.data?.message || 'Không thể kết nối đến server. Vui lòng thử lại sau';
      
      setError(errorMsg);
      message.error(`Lỗi khi tải danh sách sinh viên: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [authState?.token]);

  // Fetch students on component mount
  useEffect(() => {
    if (authState?.user && authState?.token) {
      fetchStudents();
    }
  }, [fetchStudents, authState?.user, authState?.token]);

  const showCreateModal = () => {
    setIsEditMode(false);
    setCurrentStudent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (student) => {
    setIsEditMode(true);
    setCurrentStudent(student);
    form.setFieldsValue({
      name: student.name,
      username: student.username,
      major: student.major,
      className: student.class,
      status: student.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode && currentStudent) {
        // Update existing student
        await axios.put(`/api/students/${currentStudent._id}`, values, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        message.success('Cập nhật thông tin sinh viên thành công');
      } else {
        // Create new student
        await axios.post('/api/students', values, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        message.success('Tạo sinh viên mới thành công');
      }
      handleCancel();
      fetchStudents();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Lỗi xử lý yêu cầu');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      message.success('Xóa sinh viên thành công');
      fetchStudents();
    } catch (error) {
      message.error('Lỗi khi xóa sinh viên');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Mã Sinh Viên',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Chuyên Ngành',
      dataIndex: 'major',
      key: 'major',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          active: 'green',
          inactive: 'red',
          graduated: 'blue',
          suspended: 'orange'
        };
        return (
          <span style={{ color: statusColors[status] || 'black' }}>
            {status === 'active' ? 'Đang học' : 
             status === 'inactive' ? 'Ngừng học' :
             status === 'graduated' ? 'Đã tốt nghiệp' : 
             status === 'suspended' ? 'Đình chỉ' : status}
          </span>
        );
      }
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <>
          {canEdit && (
            <Button 
              icon={<EditOutlined />} 
              type="link" 
              onClick={() => showEditModal(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sinh viên này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button icon={<DeleteOutlined />} type="link" danger />
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={
          <div>
            {error}
            <div style={{ marginTop: 10 }}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchStudents}
              >
                Thử lại
              </Button>
            </div>
          </div>
        }
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <h2>Danh Sách Sinh Viên</h2>
        {canCreate && (
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={showCreateModal}
          >
            Thêm Sinh Viên
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={students} 
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: loading ? <Spin tip="Đang tải..." /> : "Không có dữ liệu"
        }}
      />

      <Modal
        title={isEditMode ? "Sửa Thông Tin Sinh Viên" : "Thêm Sinh Viên Mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên sinh viên!' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          {!isEditMode && (
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>
          )}

          {!isEditMode && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item
            name="major"
            label="Chuyên Ngành"
            rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành!' }]}
          >
            <Select placeholder="Chọn chuyên ngành">
              <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
              <Option value="Kinh tế">Kinh tế</Option>
              <Option value="Kế toán">Kế toán</Option>
              <Option value="Ngoại ngữ">Ngoại ngữ</Option>
              <Option value="Quản trị kinh doanh">Quản trị kinh doanh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="className"
            label="Lớp"
            rules={[{ required: true, message: 'Vui lòng nhập lớp học!' }]}
          >
            <Input placeholder="Nhập lớp học" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang học</Option>
              <Option value="inactive">Ngừng học</Option>
              <Option value="graduated">Đã tốt nghiệp</Option>
              <Option value="suspended">Đình chỉ</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {isEditMode ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;