
              <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent">
                {" "}
                Beautiful Career
                 <Button
                              size="lg"
                              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                              asChild
                            >
                              <Link href="/courses">Explore Courses</Link>
                            </Button>
                             
                                          <Button size="lg" variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-50 text-black-500" asChild>
                                            <Link href="/register">Join Now</Link>
                                          </Button>


                                           <section className="py-16 bg-background">
                                                <div className="container">
                                                  <div className="text-center mb-12">
                                                    <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
                                                    <p className="text-muted-foreground max-w-2xl mx-auto">
                                                      Explore our most popular beauty courses taught by industry-leading professionals.
                                                    </p>
                                                  </div>
                                          
                                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {courses.slice(0, visibleCourses).map((course) => (
                                                      <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg">
                                                        <div className="aspect-video relative overflow-hidden">
                                                          <img
                                                            src={course.image || "/placeholder.svg"}
                                                            alt={course.title}
                                                            className="object-cover w-full h-full transition-transform hover:scale-105"
                                                          />
                                                          <Badge className="absolute top-4 left-4">{course.category}</Badge>
                                                        </div>
                                                        <CardHeader>
                                                          <div className="flex justify-between items-start">
                                                            <h3 className="text-xl font-bold">{course.title}</h3>
                                                            <div className="flex items-center">
                                                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                                              <span className="text-sm font-medium">{course.rating}</span>
                                                            </div>
                                                          </div>
                                                          <p className="text-muted-foreground">{course.description}</p>
                                                        </CardHeader>
                                                        <CardContent>
                                                          <div className="flex justify-between text-sm text-muted-foreground">
                                                            <div className="flex items-center">
                                                              <Clock className="h-4 w-4 mr-1" />
                                                              <span>{course.duration}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                              <Users className="h-4 w-4 mr-1" />
                                                              <span>{course.students} students</span>
                                                            </div>
                                                          </div>
                                                          <div className="mt-4 flex items-center justify-between">
                                                            <div className="text-sm">Instructor: {course.instructor}</div>
                                                            <div className="font-bold">${course.price}</div>
                                                          </div>
                                                        </CardContent>
                                                        <CardFooter>
                                                          <Button asChild className="w-full">
                                                            <Link href={`/courses/${course.id}`}>View Course</Link>
                                                          </Button>
                                                        </CardFooter>
                                                      </Card>
                                                    ))}
                                                  </div>
                                          
                                                  {visibleCourses < courses.length && (
                                                    <div className="mt-10 text-center">
                                                      <Button onClick={showMoreCourses} variant="outline" size="lg">
                                                        Show More Courses
                                                      </Button>
                                                    </div>
                                                  )}
                                          
                                                  <div className="mt-12 text-center">
                                                    <Button asChild size="lg">
                                                      <Link href="/courses">Browse All Courses</Link>
                                                    </Button>
                                                  </div>
                                                </div>

                                                 <section className="py-16 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                                                      <div className="container">
                                                        <div className="text-center mb-12">
                                                          <h2 className="text-3xl font-bold mb-4">Why Choose Glamour Academy</h2>
                                                          <p className="text-muted-foreground max-w-2xl mx-auto">
                                                            We're committed to providing the highest quality beauty education and training.
                                                          </p>
                                                        </div>
                                                
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                                          <div className="bg-background p-6 rounded-lg shadow-sm text-center">
                                                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 mb-4">
                                                              <Users className="h-6 w-6" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold mb-2">5,000+</h3>
                                                            <p className="text-muted-foreground">Graduates</p>
                                                          </div>
                                                
                                                          <div className="bg-background p-6 rounded-lg shadow-sm text-center">
                                                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mb-4">
                                                              <BookOpen className="h-6 w-6" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold mb-2">25+</h3>
                                                            <p className="text-muted-foreground">Specialized Courses</p>
                                                          </div>
                                                
                                                          <div className="bg-background p-6 rounded-lg shadow-sm text-center">
                                                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4">
                                                              <Award className="h-6 w-6" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold mb-2">15+</h3>
                                                            <p className="text-muted-foreground">Industry Awards</p>
                                                          </div>
                                                
                                                          <div className="bg-background p-6 rounded-lg shadow-sm text-center">
                                                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mb-4">
                                                              <Calendar className="h-6 w-6" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold mb-2">10+</h3>
                                                            <p className="text-muted-foreground">Years of Excellence</p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </section>

                                                      <section className="py-16 bg-primary text-primary-foreground">
                                                          <div className="container">
                                                            <div className="max-w-3xl mx-auto text-center space-y-6">
                                                              <h2 className="text-3xl font-bold">Ready to Start Your Beauty Career?</h2>
                                                              <p className="text-lg opacity-90">
                                                                Join Glamour Academy today and transform your passion into a successful career in the beauty industry.
                                                              </p>
                                                              <div className="flex flex-col sm:flex-row justify-center gap-4">
                                                                <Button size="lg" variant="secondary" asChild>
                                                                  <Link href="/courses">Browse Courses</Link>
                                                                </Button>
                                                                <Button
                                                                  size="lg"
                                                                  variant="outline"
                                                                  className="bg-transparent border-white hover:bg-white hover:text-primary"
                                                                  asChild
                                                                >
                                                                  <Link href="/register">Register Now</Link>
                                                                </Button>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </section>
                                              </section>
              </span>

             

