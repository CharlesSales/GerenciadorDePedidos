export const isolamentoRestaurante = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  let restauranteId = null;
  
  if (user.tipo === 'funcionario') {
    restauranteId = user.dados?.restaurante_id || user.dados?.restaurante;
  } else if (user.tipo === 'restaurante') {
    restauranteId = user.dados?.id_restaurante || user.id;
  }
  
  if (!restauranteId) {
    return res.status(403).json({ error: 'Restaurante não identificado' });
  }
  
  req.restauranteId = restauranteId;
  req.whereRestaurante = { restaurante_id: restauranteId };
  
  console.log(`🏪 Requisição isolada para restaurante ${restauranteId}`);
  next();
};