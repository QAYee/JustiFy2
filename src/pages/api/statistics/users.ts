import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get filter parameters
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = (req.query.month as string) || null;

    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Build WHERE clause based on filters
    let whereClause = "WHERE YEAR(created_at) = ?";
    const queryParams = [year];

    if (month) {
      whereClause += " AND MONTHNAME(created_at) = ?";
      queryParams.push(month);
    }

    // Get total users with filters
    const [totalRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    const total = (totalRows as any)[0].total;

    // Get user registrations by month for the selected year
    let monthlyQuery = `
      SELECT 
        MONTHNAME(created_at) as monthName, 
        COUNT(*) as count 
      FROM users 
      WHERE YEAR(created_at) = ? 
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY MONTH(created_at)
    `;

    const [monthlyRows] = await connection.execute(monthlyQuery, [year]);

    // Ensure all months are represented
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthlyCounts = months.map((monthName) => {
      const found = (monthlyRows as any[]).find(
        (row) => row.monthName === monthName
      );
      return {
        month: monthName.substring(0, 3), // Abbreviate month name
        count: found ? found.count : 0,
      };
    });

    // Get users by role with filters
    const [roleRows] = await connection.execute(
      `SELECT 
        role, 
        COUNT(*) as count 
      FROM users ${whereClause}
      GROUP BY role`,
      queryParams
    );

    // Close the connection
    await connection.end();

    // Return the statistics
    res.status(200).json({
      total,
      monthly: monthlyCounts,
      byRole: roleRows,
      filters: {
        year,
        month,
      },
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({ message: "Error fetching statistics", error });
  }
}
