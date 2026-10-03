import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/database';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';

const projectColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const seedData = async () => {
  await connectDB();

  console.log('🗑️  Clearing existing data...');
  await Task.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});

  console.log('👤 Creating users...');
  const salt = await bcrypt.genSalt(12);

  const users = await User.create([
    {
      name: 'Alice Johnson',
      email: 'alice@taskflow.dev',
      passwordHash: await bcrypt.hash('password123', salt),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      role: 'admin',
    },
    {
      name: 'Bob Martinez',
      email: 'bob@taskflow.dev',
      passwordHash: await bcrypt.hash('password123', salt),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      role: 'user',
    },
    {
      name: 'Carol Chen',
      email: 'carol@taskflow.dev',
      passwordHash: await bcrypt.hash('password123', salt),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
      role: 'user',
    },
    {
      name: 'David Kim',
      email: 'david@taskflow.dev',
      passwordHash: await bcrypt.hash('password123', salt),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      role: 'user',
    },
    {
      name: 'Eva Rodriguez',
      email: 'eva@taskflow.dev',
      passwordHash: await bcrypt.hash('password123', salt),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eva',
      role: 'user',
    },
  ]);

  console.log(`✅ Created ${users.length} users`);
  console.log('\n📋 Creating projects...');

  const projectsData = [
    {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company marketing website with new branding and improved UX.',
      status: 'active',
      color: projectColors[0],
      owner: users[0]._id,
      members: [users[0]._id, users[1]._id, users[2]._id],
    },
    {
      name: 'Mobile App v2.0',
      description: 'Major version release for the iOS and Android applications with new features.',
      status: 'active',
      color: projectColors[1],
      owner: users[1]._id,
      members: [users[1]._id, users[2]._id, users[3]._id],
    },
    {
      name: 'API Integration',
      description: 'Integrate third-party payment gateway and shipping providers into the platform.',
      status: 'on-hold',
      color: projectColors[2],
      owner: users[0]._id,
      members: [users[0]._id, users[3]._id, users[4]._id],
    },
    {
      name: 'Data Analytics Dashboard',
      description: 'Build an internal analytics dashboard for tracking business KPIs and metrics.',
      status: 'completed',
      color: projectColors[3],
      owner: users[2]._id,
      members: [users[2]._id, users[4]._id],
    },
    {
      name: 'Customer Support Portal',
      description: 'Dedicated portal for customer support tickets, knowledge base, and live chat.',
      status: 'active',
      color: projectColors[4],
      owner: users[3]._id,
      members: [users[3]._id, users[0]._id, users[1]._id, users[4]._id],
    },
  ];

  const projects = await Project.create(projectsData);
  console.log(`✅ Created ${projects.length} projects`);
  console.log('\n✅ Creating tasks...');

  const tasksData = [
    // Website Redesign Tasks
    {
      title: 'Design new homepage mockup',
      description: 'Create high-fidelity mockups for the new homepage in Figma, including desktop and mobile views.',
      status: 'done',
      priority: 'high',
      project: projects[0]._id,
      assignedTo: users[1]._id,
      createdBy: users[0]._id,
      tags: ['design', 'figma'],
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Implement responsive navigation',
      description: 'Build the new responsive navigation bar with mobile hamburger menu.',
      status: 'in-progress',
      priority: 'high',
      project: projects[0]._id,
      assignedTo: users[2]._id,
      createdBy: users[0]._id,
      tags: ['frontend', 'css'],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'SEO optimization audit',
      description: 'Run a full SEO audit on the current site and create a list of improvements.',
      status: 'todo',
      priority: 'medium',
      project: projects[0]._id,
      assignedTo: users[1]._id,
      createdBy: users[0]._id,
      tags: ['seo', 'marketing'],
    },
    {
      title: 'Update content management system',
      description: 'Migrate CMS content to new structure. Ensure all blog posts are properly categorized.',
      status: 'review',
      priority: 'medium',
      project: projects[0]._id,
      assignedTo: users[2]._id,
      createdBy: users[0]._id,
      tags: ['content', 'cms'],
    },
    {
      title: 'Performance optimization',
      description: 'Improve Lighthouse score to 90+ by optimizing images, lazy loading, and code splitting.',
      status: 'todo',
      priority: 'high',
      project: projects[0]._id,
      assignedTo: null,
      createdBy: users[0]._id,
      tags: ['performance'],
    },
    // Mobile App v2.0 Tasks
    {
      title: 'Push notification system',
      description: 'Implement push notifications using FCM for both iOS and Android platforms.',
      status: 'in-progress',
      priority: 'high',
      project: projects[1]._id,
      assignedTo: users[1]._id,
      createdBy: users[1]._id,
      tags: ['mobile', 'notifications'],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Dark mode implementation',
      description: 'Add complete dark mode support following the design system guidelines.',
      status: 'todo',
      priority: 'medium',
      project: projects[1]._id,
      assignedTo: users[2]._id,
      createdBy: users[1]._id,
      tags: ['ui', 'theming'],
    },
    {
      title: 'Offline data sync',
      description: 'Implement offline support with background sync when connectivity is restored.',
      status: 'todo',
      priority: 'urgent',
      project: projects[1]._id,
      assignedTo: users[3]._id,
      createdBy: users[1]._id,
      tags: ['offline', 'sync'],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'App store screenshots',
      description: 'Create updated screenshots for App Store and Google Play listing.',
      status: 'done',
      priority: 'low',
      project: projects[1]._id,
      assignedTo: users[2]._id,
      createdBy: users[1]._id,
      tags: ['marketing', 'design'],
    },
    // API Integration Tasks
    {
      title: 'Stripe payment integration',
      description: 'Integrate Stripe API for subscription billing and one-time payments.',
      status: 'in-progress',
      priority: 'urgent',
      project: projects[2]._id,
      assignedTo: users[3]._id,
      createdBy: users[0]._id,
      tags: ['payments', 'stripe'],
    },
    {
      title: 'FedEx shipping API',
      description: 'Connect to FedEx API for real-time shipping rates and label generation.',
      status: 'todo',
      priority: 'high',
      project: projects[2]._id,
      assignedTo: users[4]._id,
      createdBy: users[0]._id,
      tags: ['shipping', 'api'],
    },
    {
      title: 'Webhook handlers',
      description: 'Build robust webhook handlers for payment events and shipping status updates.',
      status: 'todo',
      priority: 'high',
      project: projects[2]._id,
      assignedTo: users[3]._id,
      createdBy: users[0]._id,
      tags: ['webhooks', 'backend'],
    },
    // Data Analytics Dashboard Tasks
    {
      title: 'Chart library integration',
      description: 'Integrate Recharts library and create reusable chart components.',
      status: 'done',
      priority: 'high',
      project: projects[3]._id,
      assignedTo: users[2]._id,
      createdBy: users[2]._id,
      tags: ['charts', 'frontend'],
    },
    {
      title: 'Revenue metrics API',
      description: 'Build API endpoints for revenue, MRR, churn rate, and LTV metrics.',
      status: 'done',
      priority: 'high',
      project: projects[3]._id,
      assignedTo: users[4]._id,
      createdBy: users[2]._id,
      tags: ['api', 'metrics'],
    },
    {
      title: 'User retention analysis',
      description: 'Create cohort analysis and retention heat map visualizations.',
      status: 'done',
      priority: 'medium',
      project: projects[3]._id,
      assignedTo: users[2]._id,
      createdBy: users[2]._id,
      tags: ['analytics', 'ux'],
    },
    // Customer Support Portal Tasks
    {
      title: 'Ticket management system',
      description: 'Build core ticket CRUD with status tracking, priority, and assignment.',
      status: 'in-progress',
      priority: 'urgent',
      project: projects[4]._id,
      assignedTo: users[3]._id,
      createdBy: users[3]._id,
      tags: ['backend', 'tickets'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Knowledge base articles',
      description: 'Write initial set of 20 help articles covering common customer questions.',
      status: 'todo',
      priority: 'medium',
      project: projects[4]._id,
      assignedTo: users[0]._id,
      createdBy: users[3]._id,
      tags: ['content', 'support'],
    },
    {
      title: 'Live chat widget',
      description: 'Embed Intercom live chat widget and configure automation rules.',
      status: 'review',
      priority: 'high',
      project: projects[4]._id,
      assignedTo: users[1]._id,
      createdBy: users[3]._id,
      tags: ['chat', 'integration'],
    },
    {
      title: 'Email notification templates',
      description: 'Create HTML email templates for ticket confirmation, updates, and resolution.',
      status: 'todo',
      priority: 'medium',
      project: projects[4]._id,
      assignedTo: users[4]._id,
      createdBy: users[3]._id,
      tags: ['email', 'templates'],
    },
    {
      title: 'Customer satisfaction surveys',
      description: 'Implement CSAT survey system that triggers after ticket resolution.',
      status: 'todo',
      priority: 'low',
      project: projects[4]._id,
      assignedTo: null,
      createdBy: users[3]._id,
      tags: ['surveys', 'analytics'],
    },
    {
      title: 'SLA monitoring dashboard',
      description: 'Build admin view to monitor SLA compliance and escalation alerts.',
      status: 'todo',
      priority: 'high',
      project: projects[4]._id,
      assignedTo: users[3]._id,
      createdBy: users[3]._id,
      tags: ['admin', 'monitoring'],
    },
    {
      title: 'Multi-language support',
      description: 'Add i18n support for the portal with initial Spanish and French translations.',
      status: 'todo',
      priority: 'low',
      project: projects[4]._id,
      assignedTo: users[4]._id,
      createdBy: users[3]._id,
      tags: ['i18n', 'localization'],
    },
  ];

  const tasks = await Task.create(tasksData);
  console.log(`✅ Created ${tasks.length} tasks`);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📧 Test accounts (password: password123):');
  console.log('   alice@taskflow.dev  (admin)');
  console.log('   bob@taskflow.dev    (user)');
  console.log('   carol@taskflow.dev  (user)');
  console.log('   david@taskflow.dev  (user)');
  console.log('   eva@taskflow.dev    (user)');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
