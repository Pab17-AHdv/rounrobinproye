let N = 8;
let nombres = [];

function irFase2() {
    N = parseInt(document.getElementById("cantidad_N").value);
    let html = "";
    
    for(let i = 0; i < N; i++) {
        html += `<label>Participante ${i + 1}:</label><br>`;
        html += `<input type="text" id="nombre_${i}" placeholder="Nombre del jugador ${i+1}"><br>`;
    }
    
    document.getElementById("inputs_nombres").innerHTML = html;
    document.getElementById("fase1").classList.add("oculto");
    document.getElementById("fase2").classList.remove("oculto");
}

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

function calcularTorneo() {
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
        <h2 style="color: #333; margin-bottom: 5px;">🏆 PODIO DEL TORNEO (TOP 3)</h2>
        <p style="color: #666; font-size: 14px;">Basado en el puntaje total de desempate (Matemática Discreta)</p>
    </div>`;

    htmlSalida += `<div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">`;
    
    let medallas = ["🥇 1er Lugar", "🥈 2do Lugar", "🥉 3er Lugar"];
    let coloresPodio = ["#ffd700", "#c0c0c0", "#cd7f32"];

    for (let i = 0; i < Math.min(3, N); i++) {
        htmlSalida += `
            <div style="background: ${coloresPodio[i]}20; border: 2px solid ${coloresPodio[i]}; border-radius: 10px; padding: 15px 20px; width: 200px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 10px 0; color: #333;">${medallas[i]}</h3>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${participantes[i].nombre}</p>
                <p style="font-size: 14px; color: #555; margin: 0;">Puntaje: <strong>${participantes[i].total}</strong></p>
            </div>
        `;
    }
    htmlSalida += `</div>`;

    // 6. Título y Tabla completa de estadísticas generales
    htmlSalida += `<div style="margin-top: 30px;">
        <h3 style="border-bottom: 2px solid #007bff; padding-bottom: 8px; color: #007bff;">📊 Estadísticas Generales y Rendimiento</h3>
        <p style="font-size: 13px; color: #555;">Detalle de victorias directas ($M_R$), victorias indirectas por fuerza de rivales ($M_R^2$), efectividad y puntaje final.</p>
    </div>`;

    htmlSalida += `<table>
        <tr>
            <th>Posición</th>
            <th>Participante</th>
            <th>Vic. Directas ($M_R$)</th>
            <th>Vic. Indirectas ($M_R^2$)</th>
            <th>Efectividad (%)</th>
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

    // Inyectar todo en el contenedor que ya tenías preparado
    document.getElementById("tabla_resultados").innerHTML = htmlSalida;
    document.getElementById("fase3").classList.add("oculto");
    document.getElementById("fase4").classList.remove("oculto");
}