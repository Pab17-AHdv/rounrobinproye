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
    let puntaje_total = Array(N).fill(0);
    let efectividad = Array(N).fill(0);

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

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            for (let k = 0; k < N; k++) {
                MR_Cuadrado[i][j] += MR[i][k] * MR[k][j]; 
            }
        }
    }

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            vic_directas[i] += MR[i][j];
            vic_indirectas[i] += MR_Cuadrado[i][j];
        }
        puntaje_total[i] = vic_directas[i] + vic_indirectas[i];
        
        // SE CALCULA LA ESTADÍSTICA: Porcentaje de efectividad individual
        efectividad[i] = ((vic_directas[i] / (N - 1)) * 100).toFixed(1);
    }

    let max_puntaje = -1;
    let indice_ganador = -1;
    
    // AQUÍ MANTENEMOS LA TABLA Y SE LE AGREGA LA COLUMNA DE EFECTIVIDAD
    let htmlSalida = "<h2>=== TABLA DE RESULTADOS Y ESTADÍSTICAS ===</h2>";
    htmlSalida += "<table><tr><th>Nombre</th><th>Vic. Directas</th><th>Vic. Indirectas ($M_R^2$)</th><th>Efectividad</th><th>Puntaje Total</th></tr>";

    for (let i = 0; i < N; i++) {
        htmlSalida += `<tr>
                          <td><b>${nombres[i]}</b></td>
                          <td>${vic_directas[i]}</td>
                          <td>${vic_indirectas[i]}</td>
                          <td>${efectividad[i]}%</td>
                          <td><strong>${puntaje_total[i]}</strong></td>
                       </tr>`;

        if (puntaje_total[i] > max_puntaje) {
            max_puntaje = puntaje_total[i];
            indice_ganador = i;
        }
    }
    htmlSalida += "</table>";
    htmlSalida += `<h2 style="color: red; text-align: center;">¡EL GANADOR ES: ${nombres[indice_ganador]}!</h2>`;

    document.getElementById("tabla_resultados").innerHTML = htmlSalida;
    document.getElementById("fase3").classList.add("oculto");
    document.getElementById("fase4").classList.remove("oculto");
}