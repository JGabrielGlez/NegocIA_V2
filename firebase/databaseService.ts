import { addDoc, collection, getDoc, serverTimestamp,doc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { ProductoFirestore,COLLECTIONS } from "../store/types";

export const databaseServide = {
    // Añadir un producto a la colección, cabe mencionar que el producto ya debe de venir completo desde el momento en el que se manda para agregarlo a la colección.

    // Consultar un objeto de la base de datos
    async consultarProductos(userId:string):Promise <ProductoFirestore[]>{
        try{
           const prodRef = collection(db, COLLECTIONS.PRODUCTOS);
           const q = query(prodRef, where("usuarioId", "==", userId));//filtro de seguridad para solo traerme lo referido a la cuenta de cada usuario. 

        //    Ejecutar el query
           const querySnapshot = await getDocs(q);
            
        //    Mapear los datos obtenidos de la query
           return querySnapshot.docs.map(producto=>({
                id:producto.id,
                ...producto.data(),
           })) as ProductoFirestore[];

        }catch(error:any){
            console.log(
                error.code
            );
            return[];
            
        }
    }

    


    // Añadir un objeto a la colecion de producrtos
    async agregarProducto(prod: ProductoFirestore) {
        try {
            // Add a new document in collection "cities"
            // Add a new document with a generated id.
            await addDoc(collection(db,COLLECTIONS.PRODUCTOS ), {
                ...prod,
                fechaAgregado :serverTimestamp(),
            });

            // TODO al agregar un producto, debo hacer un request a la bd para tener localmeente su id

        } catch (error: any) {
            console.log(error.code);
        }
    },
};
