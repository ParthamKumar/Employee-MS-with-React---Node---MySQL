import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";

const router = express.Router();

// Registration endpoint
router.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Error registering admin' });
        }

        const query = 'INSERT INTO admin (email, password) VALUES (?, ?)';
        con.query(query, [email, hash], (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ message: 'Error registering admin' });
            }
            res.status(201).json({ message: 'Admin registered successfully', id: results.insertId });
        });
    });
});

router.post("/adminlogin", (req, res) => {
    const sql = "SELECT * FROM admin WHERE email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query error" });
        if (result.length > 0) {
            const hashedPassword = result[0].password;
            bcrypt.compare(req.body.password, hashedPassword, (err, isMatch) => {
                if (err) return res.json({ loginStatus: false, Error: "Error comparing passwords" });
                if (isMatch) {
                    const email = result[0].email;
                    const token = jwt.sign(
                        { role: "admin", email: email, id: result[0].id },
                        "jwt_secret_key",
                        { expiresIn: "1d" }
                    );
                    res.cookie('token', token);
                    return res.json({ loginStatus: true });
                } else {
                    return res.json({ loginStatus: false, Error: "Wrong email or password" });
                }
            });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_category', (req, res) => {
    const sql = "INSERT INTO category (`name`) VALUES (?)"
    con.query(sql, [req.body.category], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true})
    })
})

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

router.post('/add_employee',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee 
    (name,email,password, address, salary,image, category_id) 
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.address,
            req.body.salary, 
            req.file.filename,
            req.body.category_id
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: err})
            return res.json({Status: true})
        })
    })
})

// router.get('/employee', (req, res) => {
//     const sql = "SELECT * FROM employee";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Status: false, Error: "Query Error"})
//         return res.json({Status: true, Result: result})
//     })
// })


router.get('/employee', (req, res) => {
    const sql = `
    SELECT e.id, e.name, e.email, e.address, e.salary, e.image, c.name as category_name 
    FROM employee e
    JOIN category c ON e.category_id = c.id
    `;
    con.query(sql, (err, result) => {
        if(err) return res.json({ Status: false, Error: "Query Error: " + err });
        return res.json({ Status: true, Result: result });
    });
});

router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        set name = ?, email = ?, salary = ?, address = ?, category_id = ? 
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.salary,
        req.body.address,
        req.body.category_id
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

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
