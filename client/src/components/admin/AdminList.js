import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, message, Popconfirm, Input as AntInput, Space, Card, Tag, Tooltip, Alert, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined, EyeOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { Search } = AntInput;

const AdminList = () => {
  const { authState } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!authState?.token) {
        setError('Bạn cần đăng nhập để xem danh sách quản trị viên');
        setLoading(false);
        return;
      }
      
      console.log('Gọi API admin với token:', authState.token.substring(0, 10) + '...');
      
      const response = await axios.get('/api/admins', {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      
      if (response.data && response.data.data) {
        setAdmins(response.data.data);
        setFilteredAdmins(response.data.data);
        setError(null);
      } else {
        setError('Định dạng dữ liệu không hợp lệ từ server');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách quản trị viên:', error);
      
      const errorMsg = 
        error.response?.status === 404 ? 'API không tồn tại. Vui lòng kiểm tra cấu hình server' :
        error.response?.data?.message || 'Không thể kết nối đến server. Vui lòng thử lại sau';
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [authState?.token]);
  
  // Fetch admins on component mount
  useEffect(() => {
    if (authState?.user?.role === 'superAdmin' && authState?.token) {
      fetchAdmins();
    }
  }, [authState?.user, fetchAdmins, authState?.token]);
  
  // Search functionality
  useEffect(() => {
    if (searchText && admins.length > 0) {
      const filtered = admins.filter(
        admin => 
          admin.name?.toLowerCase().includes(searchText.toLowerCase()) || 
          admin.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          admin.username?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAdmins(filtered);
    } else {
      setFilteredAdmins(admins);
    }
  }, [searchText, admins]);
  
  // Only show this component if user is superAdmin
  if (authState?.user?.role !== 'superAdmin') {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn không có quyền quản lý danh sách quản trị viên.</p>
      </div>
    );
  }

  const showCreateModal = () => {
    setIsEditMode(false);
    setCurrentAdmin(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (admin) => {
    setIsEditMode(true);
    setCurrentAdmin(admin);
    form.setFieldsValue({
      name: admin.name,
      email: admin.email,
      permissions: {
        createStudent: admin.permissions?.createStudent || false,
        editStudent: admin.permissions?.editStudent || false,
        deleteStudent: admin.permissions?.deleteStudent || false,
        assignAdmin: admin.permissions?.assignAdmin || false,
        manageForums: admin.permissions?.manageForums || false,
        manageClasses: admin.permissions?.manageClasses || false
      }
    });
    setIsModalOpen(true);
  };

  const showDetailModal = (admin) => {
    setCurrentAdmin(admin);
    setIsDetailModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDetailModalCancel = () => {
    setIsDetailModalOpen(false);
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode && currentAdmin) {
        // Update existing admin permissions
        await axios.put(`/api/admins/${currentAdmin._id}/permissions`, {
          permissions: values.permissions
        }, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        message.success('Cập nhật quyền quản trị viên thành công');
      } else {
        // Create new admin
        await axios.post('/api/admins', {
          username: values.username,
          password: values.password,
          name: values.name,
          email: values.email,
          permissions: values.permissions
        }, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        message.success('Tạo quản trị viên mới thành công');
      }
      handleCancel();
      fetchAdmins();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Lỗi xử lý yêu cầu');
    }
  };

  const handleChangePassword = async () => {
    if (!currentAdmin) return;
    
    try {
      const password = form.getFieldValue('newPassword');
      if (!password || password.length < 6) {
        return message.error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      
      await axios.put(`/api/admins/${currentAdmin._id}/reset-password`, {
        newPassword: password
      }, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      
      message.success('Đặt lại mật khẩu thành công');
      handleDetailModalCancel();
    } catch (error) {
      message.error('Lỗi khi đặt lại mật khẩu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admins/${id}`, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      message.success('Xóa quản trị viên thành công');
      fetchAdmins();
    } catch (error) {
      message.error('Lỗi khi xóa quản trị viên');
      console.error(error);
    }
  };

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu quản trị viên"
        description={
          <div>
            {error}
            <div style={{ marginTop: 10 }}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchAdmins}
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
  
  const columns = [
    {
      title: 'Tên quản trị viên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Quyền hạn',
      key: 'permissions',
      render: (_, record) => (
        <div>
          {record.permissions?.createStudent && <Tag color="green">Thêm sinh viên</Tag>}
          {record.permissions?.editStudent && <Tag color="blue">Sửa sinh viên</Tag>}
          {record.permissions?.deleteStudent && <Tag color="red">Xóa sinh viên</Tag>}
          {record.permissions?.assignAdmin && <Tag color="purple">Cấp quyền admin</Tag>}
          {record.permissions?.manageForums && <Tag color="orange">Quản lý diễn đàn</Tag>}
          {record.permissions?.manageClasses && <Tag color="cyan">Quản lý lớp học</Tag>}
          {!record.permissions?.createStudent && !record.permissions?.editStudent && 
           !record.permissions?.deleteStudent && !record.permissions?.assignAdmin &&
           !record.permissions?.manageForums && !record.permissions?.manageClasses && 
           <Tag color="default">Không có quyền</Tag>}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              type="link" 
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa quyền">
            <Button 
              icon={<EditOutlined />} 
              type="link" 
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa quản trị viên"
            description="Bạn có chắc chắn muốn xóa quản trị viên này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            placement="left"
          >
            <Button icon={<DeleteOutlined />} type="link" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Danh Sách Quản Trị Viên" 
        extra={
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={showCreateModal}
          >
            Thêm Quản Trị Viên
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
          <Search
            placeholder="Tìm kiếm theo tên, email hoặc tên đăng nhập"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
          />
        </Space>

        <Table 
          columns={columns} 
          dataSource={filteredAdmins} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: loading ? <Spin tip="Đang tải..." /> : "Không có dữ liệu"
          }}
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={isEditMode ? "Sửa Quyền Quản Trị Viên" : "Thêm Quản Trị Viên Mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            permissions: {
              createStudent: false,
              editStudent: false,
              deleteStudent: false,
              assignAdmin: false,
              manageForums: false,
              manageClasses: false
            }
          }}
        >
          {!isEditMode && (
            <>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input placeholder="Nhập tên đăng nhập" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="name"
            label="Họ và Tên"
            rules={[{ required: !isEditMode, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nhập họ và tên" disabled={isEditMode} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: !isEditMode, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" disabled={isEditMode} />
          </Form.Item>

          <div style={{ marginBottom: '16px' }}>
            <h4>Phân quyền quản lý:</h4>
          </div>

          <Form.Item name={['permissions', 'createStudent']} valuePropName="checked">
            <Checkbox>Thêm sinh viên</Checkbox>
          </Form.Item>

          <Form.Item name={['permissions', 'editStudent']} valuePropName="checked">
            <Checkbox>Sửa thông tin sinh viên</Checkbox>
          </Form.Item>

          <Form.Item name={['permissions', 'deleteStudent']} valuePropName="checked">
            <Checkbox>Xóa sinh viên</Checkbox>
          </Form.Item>

          <Form.Item name={['permissions', 'assignAdmin']} valuePropName="checked">
            <Checkbox>Cấp quyền cho admin khác</Checkbox>
          </Form.Item>
          
          <Form.Item name={['permissions', 'manageForums']} valuePropName="checked">
            <Checkbox>Quản lý diễn đàn</Checkbox>
          </Form.Item>
          
          <Form.Item name={['permissions', 'manageClasses']} valuePropName="checked">
            <Checkbox>Quản lý lớp học</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {isEditMode ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết quản trị viên"
        open={isDetailModalOpen}
        onCancel={handleDetailModalCancel}
        footer={null}
      >
        {currentAdmin && (
          <Card bordered={false}>
            <p><strong>Tên:</strong> {currentAdmin.name}</p>
            <p><strong>Email:</strong> {currentAdmin.email}</p>
            <p><strong>Tên đăng nhập:</strong> {currentAdmin.username}</p>
            <p><strong>Quyền hạn:</strong></p>
            <div style={{ margin: '10px 0' }}>
              {currentAdmin.permissions?.createStudent && <Tag color="green">Thêm sinh viên</Tag>}
              {currentAdmin.permissions?.editStudent && <Tag color="blue">Sửa sinh viên</Tag>}
              {currentAdmin.permissions?.deleteStudent && <Tag color="red">Xóa sinh viên</Tag>}
              {currentAdmin.permissions?.assignAdmin && <Tag color="purple">Cấp quyền admin</Tag>}
              {currentAdmin.permissions?.manageForums && <Tag color="orange">Quản lý diễn đàn</Tag>}
              {currentAdmin.permissions?.manageClasses && <Tag color="cyan">Quản lý lớp học</Tag>}
              {!currentAdmin.permissions?.createStudent && !currentAdmin.permissions?.editStudent && 
               !currentAdmin.permissions?.deleteStudent && !currentAdmin.permissions?.assignAdmin &&
               !currentAdmin.permissions?.manageForums && !currentAdmin.permissions?.manageClasses && 
               <Tag color="default">Không có quyền</Tag>}
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h4>Đặt lại mật khẩu:</h4>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Button 
                  type="primary" 
                  icon={<LockOutlined />}
                  onClick={handleChangePassword}
                >
                  Đặt lại mật khẩu
                </Button>
              </Form>
            </div>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default AdminList;