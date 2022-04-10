
export class WebClient {
    version = "v0.1"
    
    baseUrl = process.env.NODE_ENV === "development" ? `/api/${this.version}` : `https://tim-api.mindfav.com/api/${this.version}`

    CallApi(url, method, headers, body){
        const handler = (resolve, reject) => {
            fetch(url, {method: method, headers: headers, body: body})
                .then(res => {
                    if(res.ok) {
                        resolve(res.json())
                    } else {
                        reject(res)
                    }
                })
                .catch(err => {
                    reject(err)
                })
        }

        return new Promise(handler)
    }

    GetAuthors() {
        const apiUrl = `${this.baseUrl}/authors`;
        return this.CallApi(apiUrl, "GET")
    }

    GetDiaries() {
        const apiUrl = `${this.baseUrl}/diaries`;
        return this.CallApi(apiUrl, "GET")
    }

    GetDiaryEntries(diaryId) {
        const apiUrl = `${this.baseUrl}/diary/${diaryId}/entries`;
        return this.CallApi(apiUrl, "GET")
    }

    SearchDiaryEntries(keyword) {
        const apiUrl = `${this.baseUrl}/diaries/entries/?keyword=${keyword}`;
        return this.CallApi(apiUrl, "GET")
    }
    
}