import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Statistic, Row, Col, Typography, Divider, Spin, Alert, message, Button } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StudentList from '../components/admin/StudentList';
import AdminList from '../components/admin/AdminList';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Kiểm tra token trước khi thực hiện request
      if (!authState.token) {
        setError('Không có quyền truy cập. Vui lòng đăng nhập lại');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/api/admins/stats', {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      
      if (response.data && response.data.data) {
        setStats(response.data.data);
        setError(null);
      } else {
        setError('Dữ liệu không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin thống kê:', err);
      setError('Không thể tải dữ liệu thống kê');
      message.error('Lỗi khi tải thông tin thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'dashboard' && authState.user && authState.token) {
      fetchStats();
    }
  }, [currentTab, authState.user, authState.token]);

  const handleMenuClick = (e) => {
    setCurrentTab(e.key);
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px' }}>Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ margin: '20px 0' }}
          action={
            <Button size="small" type="primary" onClick={fetchStats}>
              Thử lại
            </Button>
          }
        />
      );
    }

    if (!stats) {
      return (
        <Alert
          message="Không có dữ liệu"
          description="Không thể tải thông tin thống kê"
          type="warning"
          showIcon
          style={{ margin: '20px 0' }}
        />
      );
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={3}>Tổng quan hệ thống</Title>
            <Divider />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Tổng số sinh viên" 
                value={stats.totalStudents} 
                prefix={<TeamOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Sinh viên đang học" 
                value={stats.studentStatus.active} 
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Sinh viên đã tốt nghiệp" 
                value={stats.studentStatus.graduated} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Sinh viên mới tháng này" 
                value={stats.newStudentsThisMonth} 
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Card title="Trạng thái sinh viên">
              <Statistic 
                title="Đang học" 
                value={stats.studentStatus.active} 
                valueStyle={{ color: '#3f8600' }}
              />
              <Statistic 
                title="Đã tốt nghiệp" 
                value={stats.studentStatus.graduated} 
                valueStyle={{ color: '#1890ff' }}
              />
              <Statistic 
                title="Ngừng học" 
                value={stats.studentStatus.inactive} 
                valueStyle={{ color: '#faad14' }}
              />
              <Statistic 
                title="Bị đình chỉ" 
                value={stats.studentStatus.suspended} 
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card title="Người quản trị">
              <Statistic 
                title="Số lượng quản trị viên" 
                value={stats.totalAdmins} 
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Card title="Thông báo gần đây" style={{ height: '100%' }}>
              <p>
                <BellOutlined style={{ marginRight: '8px' }} />
                Hệ thống đã được cập nhật vào 19/04/2025
              </p>
              <p>
                <BellOutlined style={{ marginRight: '8px' }} />
                Các chức năng quản lý sinh viên đã được cải tiến
              </p>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'students':
        return <StudentList />;
      case 'admins':
        return <AdminList />;
      default:
        return (
          <div style={{ padding: '20px' }}>
            <Alert
              message="Chức năng đang phát triển"
              description="Chức năng này đang được phát triển và sẽ có sẵn trong phiên bản tiếp theo."
              type="info"
              showIcon
            />
          </div>
        );
    }
  };

  const canManageAdmins = authState.user?.role === 'superAdmin';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <Menu
          mode="inline"
          selectedKeys={[currentTab]}
          onClick={handleMenuClick}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Tổng quan
          </Menu.Item>
          <Menu.Item key="students" icon={<TeamOutlined />}>
            Quản lý sinh viên
          </Menu.Item>
          {canManageAdmins && (
            <Menu.Item key="admins" icon={<UserOutlined />}>
              Quản lý admin
            </Menu.Item>
          )}
          <Menu.Item key="courses" icon={<BookOutlined />}>
            Quản lý khóa học
          </Menu.Item>
          <Menu.Item key="forums" icon={<FileTextOutlined />}>
            Quản lý diễn đàn
          </Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            Cài đặt hệ thống
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, background: '#fff' }}>
          <div style={{ padding: '0 24px' }}>
            <Title level={3}>Trang Quản Trị {currentTab === 'dashboard' ? '- Tổng Quan' : 
              currentTab === 'students' ? '- Quản Lý Sinh Viên' : 
              currentTab === 'admins' ? '- Quản Lý Admin' : 
              currentTab === 'courses' ? '- Quản Lý Khóa Học' : 
              currentTab === 'forums' ? '- Quản Lý Diễn Đàn' : '- Cài Đặt'}
            </Title>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;