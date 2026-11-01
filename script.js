// Import the functions you need from the SDKs you need
// Usa los enlaces directos del CDN de Firebase (versión 10.8.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCL8G2y5VByGpnPw2AU44s8wpvCPPF-XY8",
  authDomain: "troundrobin-1dce3.firebaseapp.com",
  projectId: "troundrobin-1dce3",
  storageBucket: "troundrobin-1dce3.firebasestorage.app",
  messagingSenderId: "244337690010",
  appId: "1:244337690010:web:65267747e9cc8c85bd2623",
  measurementId: "G-6J5D5PLY5E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let N = 8;
let nombres = [];

// Función nueva para mostrar el modo dinámicamente conforme escriben el número
function actualizarModo() {
    let n = parseInt(document.getElementById("cantidad_N").value);
    let info = document.getElementById("info_modo");

    if (n < 4 || n > 16 || isNaN(n)) {
        info.innerHTML = "<span style='color:red;'>¡El límite permitido es de 4 a 16 participantes!</span>";
        return;
    }

    if (n >= 4 && n <= 6) {
        info.innerHTML = "<strong>Modo Pequeño:</strong> Ideal para pruebas rápidas y demostraciones.";
    } else if (n >= 7 && n <= 9) {
        info.innerHTML = "<strong>Modo Estándar:</strong> Configuración recomendada. Excelente equilibrio.";
    } else if (n >= 10 && n <= 16) {
        let partidos = (n * (n - 1)) / 2;
        info.innerHTML = `<strong>Modo Formato Liga:</strong> Torneo extenso (${partidos} partidos a ingresar).`;
    }
}

function irFase2() {
    N = parseInt(document.getElementById("cantidad_N").value);
    
    // Validación de seguridad (Límite duro) por si intentan forzarlo
    if (N < 4 || N > 16 || isNaN(N)) {
        alert("Por favor ingresa un número válido de participantes entre 4 y 16.");
        return;
    }

    let html = "";
    
    for(let i = 0; i < N; i++) {
        html += `<label>Participante ${i + 1}:</label><br>`;
        html += `<input type="text" id="nombre_${i}" placeholder="Nombre del jugador ${i+1}"><br>`;
    }
    
    document.getElementById("inputs_nombres").innerHTML = html;
    document.getElementById("fase1").classList.add("oculto");
    document.getElementById("fase2").classList.remove("oculto");
}

// (El resto de tus funciones: irFase3 y calcularTorneo se quedan exactamente igual)

function irFase3() {
    nombres = [];
    for(let i = 0; i < N; i++) {
        let nom = document.getElementById(`nombre_${i}`).value;
        if (nom.trim() === "") nom = `Jugador ${i+1}`;
        nombres.push(nom);
    }

    let html = "";
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            html += `
            <div class="partido">
                ¿<strong>${nombres[i]}</strong> venció a <strong>${nombres[j]}</strong>?<br>
                <select id="partido_${i}_${j}">
                    <option value="1">1 = Sí (Ganó ${nombres[i]})</option>
                    <option value="0">0 = No (Ganó ${nombres[j]})</option>
                </select>
            </div>`;
        }
    }
    
    document.getElementById("inputs_partidos").innerHTML = html;
    document.getElementById("fase2").classList.add("oculto");
    document.getElementById("fase3").classList.remove("oculto");
}

async function calcularTorneo() {
    let MR = Array.from({length: N}, () => Array(N).fill(0));
    let MR_Cuadrado = Array.from({length: N}, () => Array(N).fill(0));
    let vic_directas = Array(N).fill(0);
    let vic_indirectas = Array(N).fill(0);
    let efectividad = [];
    let puntaje_total = Array(N).fill(0);

    // 1. Llenado de matriz MR (Antisimetría)
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (i === j) {
                MR[i][j] = 0; 
            } else if (i < j) {
                let resultado = parseInt(document.getElementById(`partido_${i}_${j}`).value);
                MR[i][j] = resultado;
                MR[j][i] = (resultado === 1) ? 0 : 1; 
            }
        }
    }

    // 2. Multiplicación de Matrices Discretas (MR * MR = MR_Cuadrado / Caminos de longitud 2)
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            for (let k = 0; k < N; k++) {
                MR_Cuadrado[i][j] += MR[i][k] * MR[k][j]; 
            }
        }
    }

    // 3. Sumar filas y calcular estadísticas
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            vic_directas[i] += MR[i][j];
            vic_indirectas[i] += MR_Cuadrado[i][j];
        }
        puntaje_total[i] = vic_directas[i] + vic_indirectas[i];
        
        // Cálculo de efectividad porcentual
        let efec = N > 1 ? ((vic_directas[i] / (N - 1)) * 100).toFixed(1) : 0;
        efectividad.push(efec);
    }

    // 4. Crear un arreglo de objetos para ordenar del mejor al peor fácilmente
    let participantes = [];
    for (let i = 0; i < N; i++) {
        participantes.push({
            nombre: nombres[i],
            directas: vic_directas[i],
            indirectas: vic_indirectas[i],
            efectividad: efectividad[i],
            total: puntaje_total[i]
        });
    }

    // Ordenar de mayor a menor según el Puntaje Total (Desempate matemático)
    participantes.sort((a, b) => b.total - a.total);

    // 5. Construir el HTML visual: Podio Top 3 primero
    let htmlSalida = `<div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #333; margin-bottom: 5px;">PODIO DEL TORNEO</h2>
        <p style="color: #666; font-size: 14px;">Basado en el puntaje total de desempate</p>
    </div>`;

    htmlSalida += `<div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">`;
    
    let medallas = ["1er Lugar", "2do Lugar", "3er Lugar"];
    let coloresPodio = ["#ffd700", "#c0c0c0", "#cd7f32"];
    let imagenesPodio = ["primero.png", "segundo.png", "tercero.png"];

    for (let i = 0; i < Math.min(3, N); i++) {
        htmlSalida += `
            <div style="background: ${coloresPodio[i]}20; border: 2px solid ${coloresPodio[i]}; border-radius: 10px; padding: 15px 20px; width: 200px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;">
                    <img src="${imagenesPodio[i]}" alt="${medallas[i]}" style="width: 50px; height: 50px; object-fit: contain;">
                    <h3 style="margin: 0; color: #333;">${medallas[i]}</h3>
                </div>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${participantes[i].nombre}</p>
                <p style="font-size: 14px; color: #555; margin: 0;">Puntaje: <strong>${participantes[i].total}</strong></p>
            </div>
        `;
    }
    htmlSalida += `</div>`;

    // 6. Título y Tabla completa de estadísticas generales
    htmlSalida += `<div style="margin-top: 30px;">
        <h3 style="border-bottom: 2px solid #007bff; padding-bottom: 8px; color: #007bff; text-align: center;"> STATS</h3>
    </div>`;

    htmlSalida += `<table>
        <tr>
            <th>Posición</th>
            <th>Participante</th>
            <th>Vic. Directas</th>
            <th>Vic. Indirectas</th>
            <th>Efectividad</th>
            <th>Puntaje Total</th>
        </tr>`;

    for (let i = 0; i < N; i++) {
        htmlSalida += `<tr>
            <td><strong>#${i + 1}</strong></td>
            <td><b>${participantes[i].nombre}</b></td>
            <td>${participantes[i].directas}</td>
            <td>${participantes[i].indirectas}</td>
            <td>${participantes[i].efectividad}%</td>
            <td><strong>${participantes[i].total}</strong></td>
        </tr>`;
    }
    htmlSalida += "</table>";

    // Inyectar todo en el contenedor de resultados y cambiar de fase
    document.getElementById("tabla_resultados").innerHTML = htmlSalida;
    document.getElementById("fase3").classList.add("oculto");
    document.getElementById("fase4").classList.remove("oculto");

// 4. Armamos el objeto con la información limpia que se va a guardar
    let datosFinalesNube = {
        fecha: new Date().toLocaleDateString(),
        totalParticipantes: N,
        campeon: participantes[0].nombre,
        detallesJugadores: participantes // (tu lista con los nombres, puntos y efectividad)
    };

    // 5. Ordenamos a Firebase que guarde el documento en una colección llamada "torneos"
    try {
        await addDoc(collection(db, "torneos"), datosFinalesNube);
        console.log("¡Guardado en la nube con éxito!");
    } catch (error) {
        console.error("Error al guardar: ", error);
    }

    // ... (Aquí continúa el código que ya tienes para inyectar la tabla en el HTML)
    document.getElementById("tabla_resultados").innerHTML = htmlSalida;
    document.getElementById("fase3").classList.add("oculto");
    document.getElementById("fase4").classList.remove("oculto");
}