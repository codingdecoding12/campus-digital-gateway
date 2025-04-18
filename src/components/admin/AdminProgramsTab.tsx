import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge"; 
import { Pencil, Trash2, Plus, Search, ImageIcon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Program {
  id: string;
  title: string;
  level: string;
  description: string;
  features: string[];
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
}

const AdminProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const [newProgram, setNewProgram] = useState({
    title: "",
    level: "",
    description: "",
    features: "",
    category: "general",
    image_url: "",
  });

  const programCategories = [
    { value: "technical", label: "Technical Programs" },
    { value: "science", label: "Science Programs" },
    { value: "general", label: "General Education" },
    { value: "primary", label: "Primary Education" },
    { value: "secondary", label: "Secondary Education" },
  ];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching programs:", error);
        toast({
          title: "Error",
          description: "Failed to fetch programs. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const formattedPrograms = data.map(program => {
        let features: string[] = [];
        let category = "general";

        try {
          if (program.requirements) {
            const parsed = JSON.parse(program.requirements);
            
            if (parsed.features && Array.isArray(parsed.features)) {
              features = parsed.features;
            } else if (Array.isArray(parsed)) {
              features = parsed;
            } else if (typeof parsed === 'object') {
              features = Object.values(parsed).filter(item => typeof item === 'string');
            }
            
            if (parsed.category) {
              category = parsed.category;
            }
          }
        } catch (e) {
          if (typeof program.requirements === 'string') {
            features = program.requirements.split(',').map(item => item.trim());
          }
        }
        
        return {
          id: program.id,
          title: program.title,
          level: program.duration || "",
          description: program.description,
          features: features,
          image_url: program.image_url || "",
          category: category
        };
      });
      
      setPrograms(formattedPrograms);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch programs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProgram = async () => {
    try {
      const featuresArray: string[] = newProgram.features
        .split(",")
        .map((feature) => feature.trim())
        .filter((feature) => feature !== "");

      const requirements = {
        features: featuresArray,
        category: newProgram.category
      };

      const { data, error } = await supabase.from('programs').insert([
        {
          title: newProgram.title,
          description: newProgram.description,
          duration: newProgram.level,
          image_url: newProgram.image_url,
          requirements: JSON.stringify(requirements),
          status: 'published'
        }
      ]).select();

      if (error) {
        console.error("Error adding program:", error);
        toast({
          title: "Error",
          description: "Failed to add program. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Program added successfully.",
      });

      setNewProgram({
        title: "",
        level: "",
        description: "",
        features: "",
        category: "general",
        image_url: "",
      });
      setIsAddingProgram(false);
      fetchPrograms();
    } catch (error) {
      console.error("Error adding program:", error);
      toast({
        title: "Error",
        description: "Failed to add program. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProgram = async () => {
    if (!editingProgram) return;

    try {
      let featuresArray: string[] = [];
      
      if (typeof editingProgram.features === 'string') {
        featuresArray = (editingProgram.features as unknown as string)
          .split(",")
          .map((feature) => feature.trim())
          .filter((feature) => feature !== "");
      } else if (Array.isArray(editingProgram.features)) {
        featuresArray = editingProgram.features;
      }

      const requirements = {
        features: featuresArray,
        category: editingProgram.category || "general"
      };

      const { error } = await supabase
        .from('programs')
        .update({
          title: editingProgram.title,
          description: editingProgram.description,
          duration: editingProgram.level,
          image_url: editingProgram.image_url,
          requirements: JSON.stringify(requirements)
        })
        .eq('id', editingProgram.id);

      if (error) {
        console.error("Error updating program:", error);
        toast({
          title: "Error",
          description: "Failed to update program. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Program updated successfully.",
      });

      setEditingProgram(null);
      fetchPrograms();
    } catch (error) {
      console.error("Error updating program:", error);
      toast({
        title: "Error",
        description: "Failed to update program. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting program:", error);
        toast({
          title: "Error",
          description: "Failed to delete program. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Program deleted successfully.",
      });

      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Error",
        description: "Failed to delete program. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = 
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      activeTab === "all" || 
      program.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="inline-flex h-10">
            <TabsTrigger value="all">All Programs</TabsTrigger>
            {programCategories.map(category => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button onClick={() => setIsAddingProgram(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </div>

        <div className="relative w-64 mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search programs"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TabsContent value="all" className="space-y-4">
          {/* Programs list will be rendered here */}
        </TabsContent>

        {programCategories.map(category => (
          <TabsContent key={category.value} value={category.value} className="space-y-4">
            {/* Category-specific programs will be rendered here */}
          </TabsContent>
        ))}
      </Tabs>

      {isAddingProgram && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Program</CardTitle>
            <CardDescription>Create a new academic program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Program Name
              </label>
              <Input
                id="name"
                value={newProgram.title}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, title: e.target.value })
                }
                placeholder="e.g., Advanced Mathematics"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Program Category
              </label>
              <Select 
                value={newProgram.category} 
                onValueChange={(value) => setNewProgram({ ...newProgram, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {programCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="level" className="text-sm font-medium">
                Education Level/Duration
              </label>
              <Input
                id="level"
                value={newProgram.level}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, level: e.target.value })
                }
                placeholder="e.g., 2 Years, 4 Semesters"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium">
                Image URL
              </label>
              <Input
                id="image_url"
                value={newProgram.image_url}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500">
                Enter a URL for an image to represent this program
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newProgram.description}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, description: e.target.value })
                }
                placeholder="Describe the program"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="features" className="text-sm font-medium">
                Features
              </label>
              <Textarea
                id="features"
                value={newProgram.features}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, features: e.target.value })
                }
                placeholder="Enter features separated by commas"
                rows={2}
              />
              <p className="text-xs text-gray-500">
                Enter features separated by commas (e.g., Small class sizes, Expert faculty)
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsAddingProgram(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProgram}>Save Program</Button>
          </CardFooter>
        </Card>
      )}

      {editingProgram && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Program</CardTitle>
            <CardDescription>Update program details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Program Name
              </label>
              <Input
                id="edit-name"
                value={editingProgram.title}
                onChange={(e) =>
                  setEditingProgram({ ...editingProgram, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm font-medium">
                Program Category
              </label>
              <Select 
                value={editingProgram.category || "general"} 
                onValueChange={(value) => setEditingProgram({ ...editingProgram, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {programCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-level" className="text-sm font-medium">
                Education Level/Duration
              </label>
              <Input
                id="edit-level"
                value={editingProgram.level}
                onChange={(e) =>
                  setEditingProgram({ ...editingProgram, level: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-image_url" className="text-sm font-medium">
                Image URL
              </label>
              <Input
                id="edit-image_url"
                value={editingProgram.image_url || ""}
                onChange={(e) =>
                  setEditingProgram({ ...editingProgram, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500">
                Enter a URL for an image to represent this program
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={editingProgram.description}
                onChange={(e) =>
                  setEditingProgram({ ...editingProgram, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-features" className="text-sm font-medium">
                Features (comma-separated)
              </label>
              <Textarea
                id="edit-features"
                value={Array.isArray(editingProgram.features) 
                  ? editingProgram.features.join(", ")
                  : ""}
                onChange={(e) => {
                  setEditingProgram({ 
                    ...editingProgram, 
                    features: e.target.value.split(',').map(item => item.trim()) 
                  });
                }}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setEditingProgram(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditProgram}>Update Program</Button>
          </CardFooter>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading programs...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center py-10">
          <p>No programs found. Create your first program by clicking "Add Program" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 h-48 bg-gray-100">
                  {program.image_url ? (
                    <img 
                      src={program.image_url} 
                      alt={program.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="md:w-3/4 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{program.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {program.level && (
                          <Badge variant="outline">{program.level}</Badge>
                        )}
                        {program.category && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                            {program.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProgram(program)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteProgram(program.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                  
                  {program.features && program.features.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Features:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {program.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <Check className="h-3 w-3 text-green-500 mr-2" />
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                        {program.features.length > 4 && (
                          <div className="text-sm text-gray-500">
                            +{program.features.length - 4} more features
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProgramsTab;
