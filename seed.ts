import { db } from './src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await db.user.create({
    data: {
      email: 'admin@stackit.com',
      username: 'admin',
      name: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create sample users
  const userPassword = await bcrypt.hash('user123', 12)
  const user1 = await db.user.create({
    data: {
      email: 'john@example.com',
      username: 'john_dev',
      name: 'John Developer',
      password: userPassword,
      role: 'USER',
    },
  })

  const user2 = await db.user.create({
    data: {
      email: 'jane@example.com',
      username: 'jane_coder',
      name: 'Jane Coder',
      password: userPassword,
      role: 'USER',
    },
  })

  // Create sample tags
  const reactTag = await db.tag.create({
    data: {
      name: 'react',
      description: 'Questions about React.js library',
      color: '#61DAFB',
    },
  })

  const jsTag = await db.tag.create({
    data: {
      name: 'javascript',
      description: 'Questions about JavaScript programming',
      color: '#F7DF1E',
    },
  })

  const nodeTag = await db.tag.create({
    data: {
      name: 'nodejs',
      description: 'Questions about Node.js runtime',
      color: '#339933',
    },
  })

  // Create sample questions
  const question1 = await db.question.create({
    data: {
      title: 'How to use React hooks effectively?',
      description: '<p>I am learning React and want to understand how to use hooks like useState and useEffect properly. Can someone provide examples?</p>',
      authorId: user1.id,
      tags: {
        create: [
          { tagId: reactTag.id },
          { tagId: jsTag.id }
        ]
      }
    },
  })

  const question2 = await db.question.create({
    data: {
      title: 'Setting up a Node.js Express server',
      description: '<p>I need help setting up a basic Express server with routing. What is the best way to structure the project?</p>',
      authorId: user2.id,
      tags: {
        create: [
          { tagId: nodeTag.id },
          { tagId: jsTag.id }
        ]
      }
    },
  })

  // Create sample answers
  const answer1 = await db.answer.create({
    data: {
      content: '<p>React hooks are functions that let you use state and other React features in functional components. Here\'s a basic example:</p><pre><code>function Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}</code></pre>',
      authorId: user2.id,
      questionId: question1.id,
      isAccepted: true,
    },
  })

  const answer2 = await db.answer.create({
    data: {
      content: '<p>Here\'s a basic Express server setup:</p><pre><code>const express = require(\'express\');\nconst app = express();\n\napp.get(\'/\', (req, res) => {\n  res.send(\'Hello World!\');\n});\n\napp.listen(3000, () => {\n  console.log(\'Server running on port 3000\');\n});</code></pre>',
      authorId: user1.id,
      questionId: question2.id,
    },
  })

  // Create sample votes
  await db.vote.create({
    data: {
      userId: user1.id,
      answerId: answer1.id,
      type: 'UPVOTE',
    },
  })

  await db.vote.create({
    data: {
      userId: user2.id,
      answerId: answer2.id,
      type: 'UPVOTE',
    },
  })

  // Create sample notifications
  await db.notification.create({
    data: {
      userId: user1.id,
      type: 'ANSWER_RECEIVED',
      title: 'New Answer',
      content: 'Someone answered your question about React hooks',
    },
  })

  await db.notification.create({
    data: {
      userId: user2.id,
      type: 'ANSWER_ACCEPTED',
      title: 'Answer Accepted',
      content: 'Your answer about React hooks was accepted!',
    },
  })

  console.log('Sample data created successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
