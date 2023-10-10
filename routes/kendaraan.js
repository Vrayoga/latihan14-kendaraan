const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const connection = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, File, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {

  if (file.mimetype === "image/png") {
    cb(null, true); //izinkan file
  } else {
    cb(new Error("Jenis file tidak diizinkan"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/", function (req, res) {
  connection.query(
    "select a.no_pol as no_pol, a.nama_kendaraan as kendaraan, a.gambar_kendaraan as gambar_kendaraan ,b.id_transmisi as transmisi" +
      " from kendaraan a join transmisi b " +
      "on b.id_transmisi=a.id_transmisi order by a.no_pol desc",
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Failed",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Data kendaraan tersedia",
          data: rows,
        });
      }
    }
  );
});

router.get("/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(
    `select * from kendaraan where no_pol = ${id}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "server error",
        });
      }
      if (rows.length <= 0) {
        return res.status(400).json({
          status: false,
          message: "not found",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "data mahasiswa",
          data: rows[0],
        });
      }
    }
  );
});

router.post(
  "/store",
  upload.single("gambar_kendaraan"),
  [
    body("no_pol").notEmpty(),
    body("nama_kendaraan").notEmpty(),
    body("id_transmisi").notEmpty(),
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let data = {
      no_pol: req.body.no_pol,
      nama_kendaraan: req.body.nama_kendaraan,
      id_transmisi: req.body.id_transmisi,
      gambar_kendaraan: req.file.filename,
    };

    connection.query("INSERT INTO kendaraan SET ?", data, function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server error",
        });
      } else {
        return res.status(201).json({
          status: true,
          message: "Success",
          data: rows[0],
        });
      }
    });
  }
);

router.patch(
    "/update/:no_pol",
    upload.single("gambar_kendaraan"),
    (req, res) => {
      const no_pol = req.params.no_pol;
      const { nama_kendaraan, id_transmisi } = req.body;
      let gambar_kendaraan = req.file ? req.file.filename : null;
  

      if (!nama_kendaraan || !id_transmisi) {
        return res.status(400).json({
          status: false,
          message: "Nama Kendaraan dan ID Transmisi harus diisi",
        });
      }
      connection.query(
        "UPDATE kendaraan SET nama_kendaraan = ?, id_transmisi = ?, gambar_kendaraan = ? WHERE no_pol = ?",
        [nama_kendaraan, id_transmisi, gambar_kendaraan, no_pol],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              status: false,
              message: "Server Error",
              error: err,
            });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({
              status: false,
              message: "Kendaraan not found",
            });
          } else {
            return res.status(200).json({
              status: true,
              message: "Update berhasil",
            });
          }
        }
      );
    }
  );
  
  router.delete("/delete/(:id)", function (req, res) {
    let id = req.params.id;
  
    connection.query( `select * from kendaraan where no_pol = ${id}`,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "server error",
          });
        }
        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            message: "not found",
          });
        }
        const namaFileLama = rows[0].gambar;
        if (namaFileLama) {
          const patchFileLama = path.join(
            __dirname,
            "../public/image",
            namaFileLama
          );
          fs.unlinkSync(patchFileLama);
        }
        connection.query(
          `delete from kendaraan where no_pol = ${id}`,
          function (err, rows) {
            if (err) {
              return res.status(500).json({
                status: false,
                message: "server error",
              });
            } else {
              return res.status(200).json({
                status: true,
                message: "data berhasil dihapus",
              });
            }
          }
        );
      }
    );
  });

module.exports = router;
