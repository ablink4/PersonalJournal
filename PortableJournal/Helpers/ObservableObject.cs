using System.ComponentModel;
using System.Runtime.Serialization;

namespace PortableJournal.Helpers
{
    [DataContract]  // so Model classes can be serialized
    public class ObservableObject : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;

        internal void RaisePropertyChanged(string prop)
        {
            if(PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(prop));
            }
        }
    }
}
