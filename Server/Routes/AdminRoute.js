import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";
import nodemailer from 'nodemailer';
import 'dotenv/config';

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie('token', token)
      return res.json({ loginStatus: true });
    } else {
        return res.json({ loginStatus: false, Error:"wrong email or password" });
    }
  });
});

router.get('/departments', (req, res) => {
    const sql = "SELECT * FROM departments";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.json({ Status: false, Error: "Query Error" });
        }
        console.log("Departments fetched:", result);
        return res.json({ Status: true, Result: result });
    });
}); 


router.post('/add_category', (req, res) => {
    console.log("Add Category API Hit");  // Log to verify if the API is being called
    const sql = "INSERT INTO category (`name`) VALUES (?)";
    con.query(sql, [req.body.category], (err, result) => {
        if (err) {
            console.error("Error in query:", err); // Log detailed error
            return res.status(500).json({ Status: false, Error: "Query Error" });
        }
        return res.status(200).json({ Status: true });
    });
});

// image upload 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})
// end imag eupload 

router.post('/check_email', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ Error: "Email is required!" });
    }
  
    const sql = "SELECT email FROM employee WHERE email = ?";
    con.query(sql, [email], (err, result) => {
      if (err) {
        return res.status(500).json({ Error: "Database query error!" });
      }
  
      if (result.length > 0) {
        return res.json({ exists: true }); // Email already exists
      } else {
        return res.json({ exists: false }); // Email is unique
      }
    });
  });
  

router.post('/add_employee', upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee 
    (name, email, password, address, salary, image, department_id, post) 
    VALUES (?)`;

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Hashing Error" });

        const categoryId = req.body.department_id || null;
        const post = req.body.post || ''; // Default to an empty string if no post is provided

        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.address,
            req.body.salary,
            req.file.filename,
            categoryId,
            post  // Adding post to the values array
        ];
        con.query(sql, [values], (err, result) => {
            if (err) return res.json({ Status: false, Error: err });
           // Send email notification
           const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER, // Replace with your email
                pass: process.env.EMAIL_PASS, // Replaced with app-specific password
              },
            });
      
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: req.body.email, // Employee's email
              subject: "Welcome to the No. 1 Company! 🥳",
              text: `Hi ${req.body.name},\n\nYour account has been created successfully.\n\nHere are your login details:\nEmail: ${req.body.email}\nPassword: ${req.body.password}\n\nPlease log in and change your password for security.\n\nBest regards,\nGray Coders`,
            };
      
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("Error sending email:", error);
                return res.json({ Status: false, Error: "Email not sent" });
              }
              console.log("Email sent: " + info.response);
              return res.json({
                Status: true,
                Message: "Employee added and email sent successfully!",
              });
            });
      
            return res.json({ Status: true });
           
          });
        });
      });


// router.get('/employee', (req, res) => {
//     const sql = "SELECT * FROM employee";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Status: false, Error: "Query Error"})
//         return res.json({Status: true, Result: result})
//     })
// })


router.get('/employee', (req, res) => {
    const sql = `
    SELECT e.id, e.name, e.email, e.address, e.salary, e.image, 
    IFNULL(d.department_name, '') as category_name , e.post
    FROM employee e 
    LEFT JOIN departments d ON e.department_id = d.department_id
    `;
    con.query(sql, (err, result) => {
        if(err) return res.json({ Status: false, Error: "Query Error: " + err });
        return res.json({ Status: true, Result: result });
    });
});


router.get('/employee/:id', (req, res) => {
    const sql = `
    SELECT e.id, e.name, e.email, e.address, e.salary, e.image, e.department_id, 
           IFNULL(d.department_name, '') AS category_name
    FROM employee e
    LEFT JOIN departments d ON e.department_id = d.department_id
    WHERE e.id = ?`;
    con.query(sql, [req.params.id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error: " + err });
        if (result.length > 0) {
            return res.json({ Status: true, Result: result });
        } else {
            return res.json({ Status: false, Error: "Employee not found" });
        }
    });
});

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        SET name = ?, email = ?, salary = ?, address = ?, department_id = ?, post = ? 
        WHERE id = ?`;

    const values = [
        req.body.name,
        req.body.email,
        req.body.salary,
        req.body.address,
        req.body.department_id,
        req.body.post // Add post to the values
    ];

    con.query(sql, [...values, id], (err, result) => {
        if (err) {
            return res.json({ Status: false, Error: "Query Error" + err });
        }
        return res.json({ Status: true, Result: result });
    });
});

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from employee where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "select sum(salary) as salaryOFEmp from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/top_employee', (req, res) => {
    const sql = "SELECT name, salary FROM employee ORDER BY salary DESC LIMIT 5";  // Fetch top 5 employees
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error: " + err });
        return res.json({ Status: true, Result: result });
    });
});



router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export { router as adminRouter };
