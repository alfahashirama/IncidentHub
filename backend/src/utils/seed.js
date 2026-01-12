require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Incident } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Efface toutes les données (DEV ONLY)
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared');
    
    // Crée des utilisateurs de test
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@incidenthub.com',
      password: 'password123',
      role: 'admin'
    });
    
    const manager = await User.create({
      firstName: 'John',
      lastName: 'Manager',
      email: 'manager@incidenthub.com',
      password: 'password123',
      role: 'manager'
    });
    
    const agent1 = await User.create({
      firstName: 'Alice',
      lastName: 'Agent',
      email: 'alice@incidenthub.com',
      password: 'password123',
      role: 'agent'
    });
    
    const agent2 = await User.create({
      firstName: 'Bob',
      lastName: 'Developer',
      email: 'bob@incidenthub.com',
      password: 'password123',
      role: 'agent'
    });
    
    console.log('✅ Users created');
    
    // Crée des incidents de test
    await Incident.create({
      title: 'Server down in production',
      description: 'The main API server is not responding. Need immediate attention.',
      priority: 'critical',
      status: 'open',
      createdById: admin.id,
      assignedToId: agent1.id
    });
    
    await Incident.create({
      title: 'Database backup failed',
      description: 'The automated backup script failed last night. Need to investigate.',
      priority: 'high',
      status: 'in_progress',
      createdById: manager.id,
      assignedToId: agent2.id
    });
    
    await Incident.create({
      title: 'Email notifications not working',
      description: 'Users are reporting that they are not receiving email notifications.',
      priority: 'medium',
      status: 'open',
      createdById: agent1.id
    });
    
    await Incident.create({
      title: 'UI bug in dashboard',
      description: 'The chart on the dashboard is not displaying correctly in Safari.',
      priority: 'low',
      status: 'resolved',
      createdById: agent2.id,
      assignedToId: agent1.id,
      resolvedAt: new Date()
    });
    
    console.log('✅ Incidents created');
    console.log('🎉 Seeding completed successfully!');
    console.log('\n📧 Test credentials:');
    console.log('   Admin: admin@incidenthub.com / password123');
    console.log('   Manager: manager@incidenthub.com / password123');
    console.log('   Agent: alice@incidenthub.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();