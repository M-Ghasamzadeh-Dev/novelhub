/* ===================================================================
   NovelHub — Author dashboard helpers
   =================================================================== */

const Dashboard = {
  myNovels(){
    const u = Auth.currentUser();
    if(!u) return [];
    return Repo.novels().filter(n=>n.createdBy===u.id);
  },
  stats(){
    const mine = this.myNovels();
    const u = Auth.currentUser();
    return {
      novelCount: mine.length,
      views: mine.reduce((s,n)=>s+n.views,0),
      likes: mine.reduce((s,n)=>s+n.likes,0),
      comments: mine.reduce((s,n)=>s + Repo.comments(n.id).length, 0),
      followers: u ? (u.followers||0) : 0
    };
  },
  deleteNovel(novelId){
    let novels = Repo.novels().filter(n=>n.id!==novelId);
    Repo.saveNovels(novels);
    let chapters = Repo.allChapters().filter(c=>c.novelId!==novelId);
    Repo.saveChapters(chapters);
    Toast.show('رمان حذف شد.', 'success');
  }
};
