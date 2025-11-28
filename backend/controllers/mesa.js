import { supabase } from "../supabaseClient.js";
import QRCode from "qrcode"

export async function listarMesa(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(402).json({
            msg: "O campo id_restaurante não pode ser null"
        })
    }

    try {

        const { data, error } = await supabase
            .from("mesa")
            .select("*")
            .eq("restaurante", id)

        if (error) {
            console.log("Deu merda!")
            res.status(402).json({
                msg: 'erro:',
                error: error.message
            })
        }

        return res.status(200).json({
            msg: "Mesas encontradas com sucesso.",
            data
        });
    } catch (err) {
        console.log("Puta que pariu", err)
        return res.status(500).json({
            msg: "Erro no servidor",
            error: err.message
        })
    }
}

export async function criarMesa(req, res) {
    const { numeroMesa, restaurante } = req.body;


    console.log(`numero da mesa: ${numeroMesa}\nid do restaurante ${restaurante}`)

    try {

        if (!numeroMesa || !restaurante) {
            return res.status(404).json({
                msg: "Os campos não podem ser null"
            })
        }

        const { data: mesaCriada, error: erro } = await supabase
            .from("mesa")
            .insert({
                numeroMesa,
                restaurante
            })
            .select()

        if (erro) {
            return res.status(402).json({
                msg: "Deu alguma merda",
                error: erro.message
            })
        }
        
        const id_mesa = mesaCriada[0].id

        const url = `https://gerenciadordepedidos.onrender.com/cardapioMesa?id_restaurante=${restaurante}&id_mesa=${id_mesa}`;
        const qrImage = await QRCode.toDataURL(url);
        
        const { error: updateError } = await supabase
            .from("mesa")
            .update({
                qr_url: url ,
                qr_imagem: qrImage 
            })
            .eq("id", id_mesa)
            
        if (updateError){
            res.status(400).json({
                msg: "erro ao atualizar",
                error: updateError.message
            })
        }

        return res.status(200).json({
            msg: "Mesa criada com sucesso!",
            mesa: {
                ...mesaCriada[0],
                qr_url: url,
                qr_imagem: qrImage
            }
        });

    } catch (err) {
        return res.status(500).json({
            msg: "Erro no servidor",
            error: err.message
        })
    }
}

