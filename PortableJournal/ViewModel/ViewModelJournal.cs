using PortableJournal.Helpers;

namespace PortableJournal.ViewModel
{
    public class ViewModelJournal : ObservableObject, IViewModel
    {
        private string _name;

        public ViewModelJournal() { }

        public string Name
        {
            get
            {
                return _name ?? string.Empty;
            }
        }

        public string JournalName
        {
            get { return "My Journal"; }
        }

    }
}
