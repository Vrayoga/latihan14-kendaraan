const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const connection = require("../config/db");

router.get("/", function (req, res) {
  connection.query("SELECT * from transmisi", function (err, rows) {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Failed",
        error: err,
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Data transmisi ada",
        data: rows,
      });
    }
  });
});

router.get("/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(
    `select * from transmisi where id_transmisi = ${id}`,
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
          message: "data transmisi ada",
          data: rows[0],
        });
      }
    }
  );
});

router.post("/tambah", [body("nama_transmisi").notEmpty()], (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }
  let data = {
    nama_transmisi: req.body.nama_transmisi,
  };

  connection.query("INSERT INTO transmisi SET ?", data, function (err, rows) {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server error",
      });
    } else {
      return res.status(201).json({
        status: true,
        message: "berhasil menambah data",
        data: rows[0],
      });
    }
  });
});

router.patch("/update/:id", [body("nama_transmisi").notEmpty()], (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }
  let id = req.params.id;
  let data = {
    nama_transmisi: req.body.nama_transmisi,
  };
  connection.query(
    `update transmisi set ? where id_transmisi = ${id}`,
    data,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "server error",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "update transmisi berhasil......",
        });
      }
    }
  );
});

router.delete("/delete/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(
    `delete from transmisi where id_transmisi = ${id}`,
    function (err, rows) {
      if (err) {
        return req.status(500).json({
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
});

module.exports = router;
