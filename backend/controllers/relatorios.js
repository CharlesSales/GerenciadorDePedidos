import { supabase } from "../supabaseClient.js";
import jwt from "jsonwebtoken";

export async function relatorios(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    console.log('token do user: \n',token)
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const restauranteId = decoded.restaurante_id;

    // 📅 Datas base
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const inicioSemana = new Date(inicioDia);
    inicioSemana.setDate(inicioDia.getDate() - inicioDia.getDay());
    const inicioMes = new Date(inicioDia.getFullYear(), inicioDia.getMonth(), 1);
    const inicioAno = new Date(inicioDia.getFullYear(), 0, 1);

    const { data: ano_total } = await supabase
  .from("pedidos_geral")
  .select("sum(total)")
  .eq("restaurante", restauranteId)
  .gte("data_hora", inicioDia.toISOString());
    // 🔧 Queries paralelas e agregadas
    const queries = [
      // Totais
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).gte("data_hora", inicioDia.toISOString()),
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).gte("data_hora", inicioSemana.toISOString()),
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).gte("data_hora", inicioMes.toISOString()),
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).gte("data_hora", inicioAno.toISOString()),
      // Totais pagos
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).eq("pag", "pago").gte("data_hora", inicioDia.toISOString()),
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).eq("pag", "pago").gte("data_hora", inicioSemana.toISOString()),
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).eq("pag", "pago").gte("data_hora", inicioMes.toISOString()),
      supabase.from("pedidos_geral").select("sum(total)").eq("restaurante", restauranteId).eq("pag", "pago").gte("data_hora", inicioAno.toISOString())
    ];

    const [
      dia_total, semana_total, mes_total,
      dia_pago, semana_pago, mes_pago, ano_pago
    ] = await Promise.all(queries.map(q => q.then(r => r.data)));

    const relatorio = {
      total_dia: dia_total?.[0]?.sum || 0,
      total_semana: semana_total?.[0]?.sum || 0,
      total_mes: mes_total?.[0]?.sum || 0,
      total_ano: ano_total?.[0]?.sum || ano_total?.[0]?.sum_total || 0,
      total_dia_pago: dia_pago?.[0]?.sum || 0,
      total_semana_pago: semana_pago?.[0]?.sum || 0,
      total_mes_pago: mes_pago?.[0]?.sum || 0,
      total_ano_pago: ano_pago?.[0]?.sum || 0
    };

    res.json(relatorio);
  } catch (error) {
    console.error("❌ Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
}