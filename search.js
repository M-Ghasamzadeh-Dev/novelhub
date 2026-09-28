/* ===================================================================
   NovelHub — Real-time search over demo data
   =================================================================== */

const Search = {
  run({q='', genre='', status='', age='', sort='newest'}={}){
    let list = Repo.novels();
    if(q){
      const query = q.trim().toLowerCase();
      list = list.filter(n=>{
        const author = Repo.authorById(n.author);
        return n.title.toLowerCase().includes(query)
          || (author && author.name.toLowerCase().includes(query))
          || n.genres.some(g=>genreName(g).includes(query))
          || n.tags.some(t=>t.toLowerCase().includes(query));
      });
    }
    if(genre) list = list.filter(n=>n.genres.includes(genre));
    if(status) list = list.filter(n=>n.status===status);
    if(age) list = list.filter(n=>n.ageRating===age);
    return Novels.sortList(list, sort);
  }
};
