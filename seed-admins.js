const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

mongoose.connect("mongodb://mongodb:27017/tienda_db")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(e  => { console.error("❌ Error:", e.message); process.exit(1); });

const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  nombre:   String,
  correo:   { type: String, unique: true, sparse: true },
  password: String,
  busto:    Number,
  cintura:  Number,
  cadera:   Number,
  rol:      { type: String, default: "usuario" }
}));

const admins = [
  { nombre: "Xander Orozco",  correo: "xander@smartfit.com"  },
  { nombre: "Edward Pantoja", correo: "edward@smartfit.com"  },
  { nombre: "Mariana Mina",   correo: "mariana@smartfit.com" },
  { nombre: "Paula Lozano",   correo: "paula@smartfit.com"   },
];

async function seed() {
  const hash = await bcrypt.hash("Admin23", 10);
  for (const admin of admins) {
    const existe = await Usuario.findOne({ correo: admin.correo });
    if (existe) {
      await Usuario.updateOne({ correo: admin.correo }, { $set: { rol: "admin", password: hash } });
      console.log("🔄 Actualizado: " + admin.nombre);
    } else {
      await Usuario.create({ ...admin, password: hash, rol: "admin" });
      console.log("✅ Creado: " + admin.nombre + " (" + admin.correo + ")");
    }
  }
  console.log("\n🎉 Listo. Contraseña de todos: Admin23");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });