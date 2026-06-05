// frontend API service that uses the axios library to make HTTP requests to the backend server. 
import axios from 'axios';

const api=axios.create({
    baseURL:'http://localhost:3001/api',
});

export async function uploadFile(file,onProgress){
    const form=new FormData();
    form.append('file',file);

    const {data} = await api.post('/upload',form,{
        headers:{'Content-Type': 'multipart/form-data'},
            onUploadProgress:(e)=>{
                if(onProgress){
                    onProgress(Math.round((e.loaded*100)/e.total));
                }
            },
    });
    return data;
}

export async function searchDocuments(query, from =0,size =10){
    const {data} = await api.get('/search', {
        params: {q: query, from, size},
    });
    return data;
}

export async function getDocument(id){
    const {data} =await api.get(`/documents/${id}`);
    return data;
}

export async function deleteDocument(id){
    const {data} = await api.delete(`/documents/${id}`);
    return data;
}