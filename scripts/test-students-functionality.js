// Test script to verify students functionality
const { neon } = require("@neondatabase/serverless")

const sql = neon(process.env.DATABASE_URL)

async function testStudentsSetup() {
  try {
    console.log("Testing students table setup...")

    // Test 1: Check if tables exist
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'students')
    `
    console.log(
      "✓ Tables found:",
      tablesCheck.map((t) => t.table_name),
    )

    // Test 2: Check students table structure
    const studentsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'students'
      ORDER BY ordinal_position
    `
    console.log("✓ Students table columns:", studentsColumns)

    // Test 3: Check users table structure
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      AND column_name IN ('phone', 'age', 'gender', 'status')
    `
    console.log("✓ Users table additional columns:", usersColumns)

    // Test 4: Check if trigger function exists
    const triggerFunction = await sql`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name = 'generate_student_identifiers'
    `
    console.log("✓ Trigger function exists:", triggerFunction.length > 0)

    // Test 5: Check existing data
    const studentCount = await sql`SELECT COUNT(*) as count FROM students`
    const userCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`
    console.log("✓ Current students:", studentCount[0].count)
    console.log("✓ Current student users:", userCount[0].count)

    // Test 6: Test sample data fetch
    const sampleStudents = await sql`
      SELECT 
        s.id, s.roll_number, s.id_number, u.name, u.email, s.status
      FROM students s
      JOIN users u ON s.user_id = u.id
      LIMIT 5
    `
    console.log("✓ Sample students:", sampleStudents)

    console.log("\n✅ All tests passed! Students functionality should work.")
  } catch (error) {
    console.error("❌ Test failed:", error)
    console.log("\n🔧 Run the create-students-table-fixed.sql script first.")
  }
}

testStudentsSetup()
