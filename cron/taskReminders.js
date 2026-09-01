const cron = require('node-cron');
const Task = require('../models/tasks');
const TaskCompletion = require('../models/taskCompletion');
const RoomMember = require('../models/roomMembers');
const Notification = require('../models/notifications');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily task deadline checks...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);

  try {
    const tasksDueTomorrow = await Task.find({
      dueDate: { $gte: tomorrow, $lt: nextDay }
    });

    for (const task of tasksDueTomorrow) {
      const members = await RoomMember.find({ roomId: task.roomId });
      for (const member of members) {
        const completed = await TaskCompletion.findOne({ taskId: task._id, userId: member.userId });
        if (!completed || !completed.isCompleted) {
          const notification = new Notification({
            recipient: member.userId,
            type: 'reminder',
            title: 'Task Deadline Reminder',
            message: `Task "${task.title}" is due tomorrow!`,
            link: `/rooms/${task.roomId}/study-plan`
          });
          await notification.save();
        }
      }
    }
  } catch (error) {
    console.error('Error in cron job', error);
  }
});